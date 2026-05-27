import prisma from '../../login/lib/prisma';
import { AppError } from '../../shared/utils/app-error.util';
import {
  assertInventoryAvailable,
  calculateBookingSubtotal,
  ensureApprovedHotelMirror,
  normalizeBookingType,
  updateBookingStatusWithInventory,
} from '../../shared/services/lodging-sync.service';
import {
  decrementVoucherUsageByCode,
  incrementVoucherUsage,
  validateVoucher,
} from '../../shared/services/voucher-validation.service';

const DEFAULT_ROOM_IMAGE = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800';

const makeValidationError = (message: string) =>
  new AppError(400, 'VALIDATION_ERROR', { userMessage: message });

const makeNotFoundError = (message: string) =>
  new AppError(404, 'RESOURCE_NOT_FOUND', { userMessage: message });

const parseDateInput = (value: unknown, field: string) => {
  const date = new Date(String(value || ''));
  if (Number.isNaN(date.getTime())) {
    throw makeValidationError(`${field} khong hop le.`);
  }
  return date;
};

const formatMoney = (value: number) => `${Math.round(value || 0).toLocaleString('vi-VN')}d`;

const inferBookingTypeLabel = (booking: any) => {
  const hours = Math.max(1, Math.ceil((booking.checkOut.getTime() - booking.checkIn.getTime()) / (60 * 60 * 1000)));
  if (hours <= 12 && booking.checkIn.toDateString() === booking.checkOut.toDateString()) return 'Theo gio';
  if (hours <= 16) return 'Qua dem';
  return 'Theo ngay';
};

const mapCustomerStatus = (status: string) => {
  if (status === 'CANCELLED') return 'Da huy';
  if (status === 'COMPLETED') return 'Hoan thanh';
  if (status === 'CONFIRMED') return 'Da xac nhan';
  return 'Cho nhan phong';
};

const getRoomImage = async (roomId: string) => {
  const media = await prisma.roomMedia.findFirst({
    where: { roomTypeId: roomId, mediaType: 'image' },
    orderBy: { sortOrder: 'asc' },
  });
  return media?.imageUrl || DEFAULT_ROOM_IMAGE;
};

const normalizeBooking = async (booking: any) => {
  const roomImage = await getRoomImage(booking.roomId).catch(() => DEFAULT_ROOM_IMAGE);
  const review = booking.reviews?.[0] || null;

  return {
    id: booking.id,
    code: booking.id.slice(0, 8).toUpperCase(),
    hotelId: booking.propertyId,
    hotelName: booking.property?.name || booking.room?.property?.name || 'Khach san',
    hotelAddress: booking.property?.address || booking.room?.property?.address || '',
    hotelImage: booking.property?.images?.[0] || roomImage,
    roomId: booking.roomId,
    roomName: booking.room?.name || 'Phong',
    roomImage,
    price: formatMoney(Number(booking.totalPrice || 0)),
    totalPrice: Number(booking.totalPrice || 0),
    voucherCode: booking.voucherCode,
    bookingType: inferBookingTypeLabel(booking),
    checkIn: booking.checkIn.toISOString(),
    checkOut: booking.checkOut.toISOString(),
    guests: booking.guests,
    customerName: booking.user?.username,
    customerPhone: booking.user?.phone || null,
    status: mapCustomerStatus(booking.status),
    rawStatus: booking.status,
    createdAt: booking.createdAt.toISOString(),
    canReview: booking.status === 'COMPLETED' && !review,
    review,
  };
};

const bookingInclude = {
  user: { select: { username: true, phone: true } },
  property: true,
  room: { include: { property: true } },
  reviews: { orderBy: { createdAt: 'desc' } },
} as const;

export const customerBookingService = {
  create: async (userId: string, data: any) => {
    const hotelId = String(data.hotelId || '');
    const roomTypeId = String(data.roomTypeId || data.roomId || '');
    if (!hotelId || !roomTypeId) {
      throw makeValidationError('Thieu thong tin khach san hoac loai phong.');
    }

    const checkIn = parseDateInput(data.checkIn, 'checkIn');
    const checkOut = parseDateInput(data.checkOut, 'checkOut');
    if (checkOut <= checkIn) {
      throw makeValidationError('Thoi gian tra phong phai sau thoi gian nhan phong.');
    }

    const booking = await prisma.$transaction(async (tx) => {
      const { roomType } = await ensureApprovedHotelMirror(tx, hotelId, roomTypeId, checkIn, checkOut);
      await assertInventoryAvailable(tx, roomTypeId, Number(roomType.totalUnits || 0), checkIn, checkOut);

      const subtotal = calculateBookingSubtotal(roomType, data.bookingType, checkIn, checkOut);
      let totalPrice = subtotal;
      let voucherCode: string | null = null;

      if (data.voucherCode) {
        const voucherResult = await validateVoucher(tx, {
          hotelId,
          roomTypeId,
          subtotal,
          code: String(data.voucherCode),
        });
        await incrementVoucherUsage(tx, voucherResult.voucher.id, Number(voucherResult.voucher.usageLimit || 0));
        totalPrice = voucherResult.finalTotal;
        voucherCode = voucherResult.voucher.code;
      }

      const created = await tx.booking.create({
        data: {
          userId,
          propertyId: hotelId,
          roomId: roomTypeId,
          checkIn,
          checkOut,
          guests: Number(data.guests || 1),
          totalPrice,
          voucherCode,
          status: 'PENDING',
        },
        include: bookingInclude,
      });

      return created;
    });

    return normalizeBooking(booking);
  },

  listByCustomer: async (userId: string) => {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: bookingInclude,
      orderBy: { createdAt: 'desc' },
    });
    return Promise.all(bookings.map(normalizeBooking));
  },

  getById: async (userId: string, bookingId: string) => {
    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId },
      include: bookingInclude,
    });
    if (!booking) throw makeNotFoundError('Khong tim thay booking.');
    return normalizeBooking(booking);
  },

  cancel: async (userId: string, bookingId: string) => {
    const booking = await prisma.$transaction(async (tx) => {
      const current = await tx.booking.findFirst({
        where: { id: bookingId, userId },
        include: bookingInclude,
      });
      if (!current) throw makeNotFoundError('Khong tim thay booking.');

      if (current.status !== 'CANCELLED') {
        const updated = await updateBookingStatusWithInventory(tx, bookingId, 'CANCELLED');
        if (current.voucherCode && !current.paymentId) {
          await decrementVoucherUsageByCode(tx, current.propertyId, current.voucherCode);
        }
        return updated;
      }

      return current;
    });

    return normalizeBooking(booking);
  },

  createReview: async (userId: string, bookingId: string, data: any) => {
    const rating = Number(data.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw makeValidationError('So sao danh gia phai tu 1 den 5.');
    }

    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findFirst({
        where: { id: bookingId, userId },
        include: { reviews: true },
      });
      if (!booking) throw makeNotFoundError('Khong tim thay booking.');
      if (booking.status !== 'COMPLETED') {
        throw makeValidationError('Chi co the danh gia booking da hoan thanh.');
      }
      if (booking.reviews.length > 0) {
        throw makeValidationError('Booking nay da co danh gia.');
      }

      return tx.review.create({
        data: {
          userId,
          bookingId,
          rating,
          comment: data.comment ? String(data.comment) : null,
          images: Array.isArray(data.images) ? data.images.map(String) : [],
          status: 'PENDING',
        },
      });
    });
  },

  listApprovedReviewsByHotel: async (hotelId: string) => {
    const reviews = await prisma.review.findMany({
      where: {
        status: 'APPROVED',
        booking: { propertyId: hotelId },
      },
      include: {
        user: { select: { username: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map((review: any) => ({
      id: review.id,
      name: review.user?.username || 'Khach hang',
      avatar: review.user?.avatar,
      rating: review.rating,
      text: review.comment || '',
      reply: review.reply,
      createdAt: review.createdAt,
      tag: 'Da luu tru',
    }));
  },
};

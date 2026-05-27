import prisma from '../../login/lib/prisma';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../shared/errors/AppError';
import type { BookingStatus } from '@prisma/client';
import { updateBookingStatusWithInventory } from '../../shared/services/lodging-sync.service';
import { decrementVoucherUsageByCode } from '../../shared/services/voucher-validation.service';

const ALLOWED_STATUSES = new Set(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']);

const normalizeBooking = (booking: any) => ({
  id: booking.id,
  checkIn: booking.checkIn.toISOString(),
  checkOut: booking.checkOut.toISOString(),
  totalPrice: booking.totalPrice,
  status: booking.status,
  user: {
    username: booking.user?.username || 'Khach hang',
    phone: booking.user?.phone || null,
  },
  room: {
    name: booking.room?.name || 'Phong tieu chuan',
  },
  property: {
    id: booking.property?.id || booking.room?.property?.id,
    name: booking.property?.name || booking.room?.property?.name || 'Co so luu tru',
  },
});

export class BookingService {
  /**
   * Lấy danh sách đặt phòng thuộc các khách sạn/cơ sở của Partner
   */
  async listByPartner(partnerId: string, status?: string) {
    const whereClause: any = {
      OR: [
        { hotel: { ownerId: partnerId } },
        { property: { ownerId: partnerId } },
      ],
    };

    if (status && status !== 'ALL') {
      if (!ALLOWED_STATUSES.has(status)) {
        throw new BadRequestError('Trang thai booking khong hop le', 'VALIDATION_ERROR');
      }
      whereClause.status = status as BookingStatus;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        user: {
          select: { username: true, email: true, phone: true },
        },
        roomType: {
          select: { name: true },
        },
        room: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Chuẩn hóa cấu trúc trả về cho Frontend Partner
    return bookings.map((b) => ({
      id: b.id,
      checkIn: b.checkIn.toISOString(),
      checkOut: b.checkOut.toISOString(),
      totalPrice: b.totalPrice,
      status: b.status,
      user: {
        username: b.user?.username || 'Khách hàng',
        phone: b.user?.phone || null,
      },
      room: {
        name: b.roomType?.name || b.room?.name || 'Phòng tiêu chuẩn',
      },
    }));
  }

  /**
   * Cập nhật trạng thái đơn đặt phòng
   */
  async updateStatus(bookingId: string, partnerId: string, status: BookingStatus) {
    // 1. Kiểm tra booking có tồn tại và thuộc quyền quản lý của partner
    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        hotel: { select: { ownerId: true } },
        property: { select: { ownerId: true } },
      },
    });

    if (!booking) {
      throw new NotFoundError('Không tìm thấy đơn đặt phòng', 'BOOKING_NOT_FOUND');
    }

    const isOwner =
      booking.hotel?.ownerId === partnerId || booking.property?.ownerId === partnerId;

    if (!isOwner) {
      throw new ForbiddenError('Bạn không có quyền cập nhật đơn đặt phòng này');
    }

    // 2. Cập nhật trạng thái
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        user: { select: { username: true, email: true, phone: true } },
        roomType: { select: { name: true } },
        room: { select: { name: true } },
      },
    });

    return {
      id: updated.id,
      checkIn: updated.checkIn.toISOString(),
      checkOut: updated.checkOut.toISOString(),
      totalPrice: updated.totalPrice,
      status: updated.status,
      user: {
        username: updated.user?.username || 'Khách hàng',
        phone: updated.user?.phone || null,
      },
      room: {
        name: updated.roomType?.name || updated.room?.name || 'Phòng tiêu chuẩn',
      },
    };
  }
}

export const bookingService = new BookingService();
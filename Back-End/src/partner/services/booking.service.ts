import prisma from '../../login/lib/prisma';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '../../shared/errors/AppError';
import type { BookingStatus } from '@prisma/client';

const ALLOWED_STATUSES = new Set([
  'PENDING',
  'CONFIRMED',
  'CHECKED_IN',
  'PAYMENT_PENDING',
  'CANCELLED',
  'COMPLETED',
]);

const normalizeBookingStatus = (status?: string) => {
  if (!status || status === 'ALL') return undefined;

  const normalizedStatus = String(status).trim().toUpperCase();

  if (!ALLOWED_STATUSES.has(normalizedStatus)) {
    throw new BadRequestError(
      'Trạng thái booking không hợp lệ',
      'VALIDATION_ERROR'
    );
  }

  return normalizedStatus as BookingStatus;
};

const normalizeBooking = (booking: any) => ({
  id: booking.id,
  checkIn: booking.checkIn?.toISOString?.() || booking.checkIn,
  checkOut: booking.checkOut?.toISOString?.() || booking.checkOut,
  totalPrice: Number(booking.totalPrice || 0),
  status: booking.status,

  user: {
    username: booking.user?.username || 'Khách hàng',
    phone: booking.user?.phone || null,
  },

  room: {
    name: booking.room?.name || 'Phòng tiêu chuẩn',
  },

  property: {
    id: booking.property?.id || booking.room?.property?.id || '',
    name:
      booking.property?.name ||
      booking.room?.property?.name ||
      'Cơ sở lưu trú',
  },
});

export class BookingService {
  /**
   * Lấy danh sách đặt phòng thuộc cơ sở lưu trú của Partner
   */
  async listByPartner(partnerId: string, status?: string) {
    const whereClause: any = {
      property: {
        ownerId: partnerId,
      },
    };

    const normalizedStatus = normalizeBookingStatus(status);

    if (normalizedStatus) {
      whereClause.status = normalizedStatus;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            username: true,
            email: true,
            phone: true,
          },
        },

        room: {
          select: {
            name: true,
          },
        },

        property: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return bookings.map(normalizeBooking);
  }

  /**
   * Cập nhật trạng thái đơn đặt phòng
   */
  async updateStatus(
    bookingId: string,
    partnerId: string,
    status: BookingStatus
  ) {
    const normalizedStatus = normalizeBookingStatus(status);

    if (!normalizedStatus) {
      throw new BadRequestError(
        'Trạng thái booking không hợp lệ',
        'VALIDATION_ERROR'
      );
    }

    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        property: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundError(
        'Không tìm thấy đơn đặt phòng',
        'BOOKING_NOT_FOUND'
      );
    }

    const isOwner = booking.property?.ownerId === partnerId;

    if (!isOwner) {
      throw new ForbiddenError('Bạn không có quyền cập nhật đơn đặt phòng này');
    }

    const updated = await prisma.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: normalizedStatus,
      },
      include: {
        user: {
          select: {
            username: true,
            email: true,
            phone: true,
          },
        },

        room: {
          select: {
            name: true,
          },
        },

        property: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return normalizeBooking(updated);
  }
}

export const bookingService = new BookingService();
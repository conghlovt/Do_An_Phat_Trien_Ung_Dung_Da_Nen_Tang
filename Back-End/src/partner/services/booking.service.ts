import prisma from '../../login/lib/prisma';
import { NotFoundError, ForbiddenError } from '../../shared/errors/AppError';
import type { BookingStatus } from '@prisma/client';

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

    if (status && status !== 'ALL') {
      whereClause.status = status as BookingStatus;
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
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return bookings.map((booking: any) => ({
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
        name: booking.property?.name || 'Cơ sở lưu trú',
      },
    }));
  }

  /**
   * Cập nhật trạng thái đơn đặt phòng
   */
  async updateStatus(
    bookingId: string,
    partnerId: string,
    status: BookingStatus
  ) {
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
        status,
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
            name: true,
          },
        },
      },
    });

    return {
      id: updated.id,
      checkIn: updated.checkIn?.toISOString?.() || updated.checkIn,
      checkOut: updated.checkOut?.toISOString?.() || updated.checkOut,
      totalPrice: Number(updated.totalPrice || 0),
      status: updated.status,
      user: {
        username: updated.user?.username || 'Khách hàng',
        phone: updated.user?.phone || null,
      },
      room: {
        name: updated.room?.name || 'Phòng tiêu chuẩn',
      },
      property: {
        name: updated.property?.name || 'Cơ sở lưu trú',
      },
    };
  }
}

export const bookingService = new BookingService();
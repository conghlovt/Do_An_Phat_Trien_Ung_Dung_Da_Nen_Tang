import prisma from '../../login/lib/prisma';
import {
  updateBookingStatusWithInventory,
} from '../../shared/services/lodging-sync.service';
import { decrementVoucherUsageByCode } from '../../shared/services/voucher-validation.service';

const normalizeBooking = (booking: any) => ({
  ...booking,
  property: booking.property || booking.room?.property || null,
});

export const bookingService = {
  getAllBookings: async (options: { q?: string }) => {
    const { q } = options;
    const bookings = await prisma.booking.findMany({
      where: q ? {
        OR: [
          { user: { username: { contains: q, mode: 'insensitive' } } },
          { room: { name: { contains: q, mode: 'insensitive' } } },
          { room: { property: { name: { contains: q, mode: 'insensitive' } } } },
          { status: { equals: q as any } },
        ],
      } : {},
      include: {
        user: { select: { username: true, email: true } },
        property: { select: { id: true, name: true, address: true } },
        room: {
          include: {
            property: { select: { name: true, address: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    } as any);
    return bookings.map(normalizeBooking);
  },

  updateBookingStatus: async (id: string, status: string) => {
    const booking = await prisma.$transaction(async (tx) => {
      const current = await tx.booking.findUnique({
        where: { id },
        select: { status: true, voucherCode: true, propertyId: true, paymentId: true },
      });

      const updated = await updateBookingStatusWithInventory(tx, id, status);

      if (
        current &&
        current.status !== 'CANCELLED' &&
        status === 'CANCELLED' &&
        current.voucherCode &&
        !current.paymentId
      ) {
        await decrementVoucherUsageByCode(tx, current.propertyId, current.voucherCode);
      }

      return updated;
    });
    return normalizeBooking(booking);
  },

  deleteBooking: async (id: string) => {
    await prisma.$transaction(async (tx) => {
      const current = await tx.booking.findUnique({
        where: { id },
        select: { status: true, voucherCode: true, propertyId: true, paymentId: true },
      });
      if (current && current.status !== 'CANCELLED') {
        await updateBookingStatusWithInventory(tx, id, 'CANCELLED');
      }
      if (current?.voucherCode && !current.paymentId) {
        await decrementVoucherUsageByCode(tx, current.propertyId, current.voucherCode);
      }
      await tx.review.deleteMany({ where: { bookingId: id } });
      await tx.booking.delete({ where: { id } });
    });
  },
};

import prisma from '../../lib/prisma';

const normalizeBooking = (booking: any) => ({
  ...booking,
  property: booking.room?.property || null,
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
    const booking = await prisma.booking.update({
      where: { id },
      data: { status: status as any },
      include: {
        user: { select: { username: true, email: true } },
        room: { include: { property: { select: { name: true, address: true } } } },
      },
    });
    return normalizeBooking(booking);
  },

  deleteBooking: async (id: string) => {
    await prisma.$transaction(async (tx) => {
      await tx.review.deleteMany({ where: { bookingId: id } });
      await tx.booking.delete({ where: { id } });
    });
  },
};

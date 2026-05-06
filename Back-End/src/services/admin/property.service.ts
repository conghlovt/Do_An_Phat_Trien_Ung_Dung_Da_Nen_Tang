import prisma from '../../lib/prisma';

export const propertyService = {
  getProperties: async (options: { q?: string }) => {
    const { q } = options;
    return await prisma.property.findMany({
      where: q ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { address: { contains: q, mode: 'insensitive' } },
          { city: { contains: q, mode: 'insensitive' } },
          { type: { contains: q, mode: 'insensitive' } },
        ],
      } : {},
      include: {
        owner: { select: { username: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    } as any);
  },

  updateProperty: async (id: string, data: any) => {
    const { name, description, address, city, type, status } = data;
    return await prisma.property.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(address !== undefined ? { address } : {}),
        ...(city !== undefined ? { city } : {}),
        ...(type !== undefined ? { type } : {}),
        ...(status !== undefined ? { status: status as any } : {}),
      },
      include: { owner: { select: { username: true, email: true } } },
    });
  },

  deleteProperty: async (id: string) => {
    await prisma.$transaction(async (tx) => {
      const rooms = await tx.room.findMany({ where: { propertyId: id }, select: { id: true } });
      const roomIds = rooms.map((room) => room.id);
      const bookings = roomIds.length
        ? await tx.booking.findMany({ where: { roomId: { in: roomIds } }, select: { id: true } })
        : [];
      const bookingIds = bookings.map((booking) => booking.id);

      if (bookingIds.length) {
        await tx.review.deleteMany({ where: { bookingId: { in: bookingIds } } });
        await tx.booking.deleteMany({ where: { id: { in: bookingIds } } });
      }
      if (roomIds.length) {
        await tx.room.deleteMany({ where: { id: { in: roomIds } } });
      }
      await tx.property.delete({ where: { id } });
    });
  },
};

import prisma from '../../login/lib/prisma';
import { recalculateHotelRating } from '../../shared/services/lodging-sync.service';

const normalizeReview = (review: any) => ({
  ...review,
  guest: review.user?.username || 'Khach hang',
  property: review.booking?.room?.property?.name || 'N/A',
  date: review.createdAt,
});

export const reviewService = {
  getAllReviews: async (options: { q?: string }) => {
    const { q } = options;
    const reviews = await prisma.review.findMany({
      where: q ? {
        OR: [
          { comment: { contains: q, mode: 'insensitive' } },
          { user: { username: { contains: q, mode: 'insensitive' } } },
          { booking: { room: { property: { name: { contains: q, mode: 'insensitive' } } } } },
        ],
      } : {},
      include: {
        user: { select: { username: true, email: true } },
        booking: { include: { room: { include: { property: { select: { name: true } } } } } },
      },
      orderBy: { createdAt: 'desc' },
    } as any);
    return reviews.map(normalizeReview);
  },

  updateReview: async (id: string, data: any) => {
    const { rating, comment, status, reply } = data;
    const review = await prisma.$transaction(async (tx) => {
      const updated = await tx.review.update({
        where: { id },
        data: {
          ...(rating !== undefined ? { rating: Number(rating) } : {}),
          ...(comment !== undefined ? { comment } : {}),
          ...(status !== undefined ? { status: status as any } : {}),
          ...(reply !== undefined ? { reply } : {}),
        },
        include: {
          user: { select: { username: true, email: true } },
          booking: { include: { room: { include: { property: { select: { name: true } } } } } },
        },
      });

      await recalculateHotelRating(tx, updated.booking.propertyId);
      return updated;
    });
    return normalizeReview(review);
  },

  deleteReview: async (id: string) => {
    await prisma.$transaction(async (tx) => {
      const review = await tx.review.findUnique({
        where: { id },
        include: { booking: { select: { propertyId: true } } },
      });
      await tx.review.delete({ where: { id } });
      if (review?.booking?.propertyId) {
        await recalculateHotelRating(tx, review.booking.propertyId);
      }
    });
  },
};

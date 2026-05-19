import prisma from '../../login/lib/prisma';
const normalizeReview = (review) => ({
    ...review,
    guest: review.user?.username || 'Khach hang',
    property: review.booking?.room?.property?.name || 'N/A',
    date: review.createdAt,
});
export const reviewService = {
    getAllReviews: async (options) => {
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
        });
        return reviews.map(normalizeReview);
    },
    updateReview: async (id, data) => {
        const { rating, comment, status, reply } = data;
        const review = await prisma.review.update({
            where: { id },
            data: {
                ...(rating !== undefined ? { rating: Number(rating) } : {}),
                ...(comment !== undefined ? { comment } : {}),
                ...(status !== undefined ? { status: status } : {}),
                ...(reply !== undefined ? { reply } : {}),
            },
            include: {
                user: { select: { username: true, email: true } },
                booking: { include: { room: { include: { property: { select: { name: true } } } } } },
            },
        });
        return normalizeReview(review);
    },
    deleteReview: async (id) => {
        await prisma.review.delete({ where: { id } });
    },
};
//# sourceMappingURL=review.service.js.map
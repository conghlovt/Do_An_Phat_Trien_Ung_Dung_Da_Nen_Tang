import prisma from '../../login/lib/prisma';
export const findHotelSections = async () => {
    const [flashSaleHourly, flashSaleOvernight, specialOffers, stayHubSuggest, topRated, newHotels,] = await Promise.all([
        prisma.hotelCard.findMany({
            where: {
                AND: [
                    { isActive: true },
                    { tags: { has: 'Flash Sale' } },
                    { tags: { has: 'Theo giờ' } },
                ],
            },
            orderBy: {
                sortOrder: 'asc',
            },
            take: 20,
        }),
        prisma.hotelCard.findMany({
            where: {
                AND: [
                    { isActive: true },
                    { tags: { has: 'Flash Sale' } },
                    { tags: { has: 'Qua đêm' } },
                ],
            },
            orderBy: {
                sortOrder: 'asc',
            },
            take: 20,
        }),
        prisma.hotelCard.findMany({
            where: {
                AND: [
                    { isActive: true },
                    { tags: { has: 'Ưu đãi' } },
                ],
            },
            orderBy: {
                rating: 'desc',
            },
            take: 20,
        }),
        prisma.hotelCard.findMany({
            where: {
                AND: [
                    { isActive: true },
                    { tags: { has: 'Gợi ý' } },
                ],
            },
            orderBy: {
                sortOrder: 'asc',
            },
            take: 20,
        }),
        prisma.hotelCard.findMany({
            where: {
                AND: [
                    { isActive: true },
                    { badge: { startsWith: 'Top #' } },
                ],
            },
            orderBy: {
                reviews: 'desc',
            },
            take: 20,
        }),
        prisma.hotelCard.findMany({
            where: {
                AND: [
                    { isActive: true },
                    { tags: { has: 'Mới' } },
                ],
            },
            orderBy: {
                sortOrder: 'asc',
            },
            take: 20,
        }),
    ]);
    return {
        flashSaleHourly,
        flashSaleOvernight,
        specialOffers,
        stayHubSuggest,
        topRated,
        newHotels,
    };
};
//# sourceMappingURL=home.service.js.map
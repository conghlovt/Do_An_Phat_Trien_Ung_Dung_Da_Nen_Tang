import prisma from '../../login/lib/prisma';
export const findHotelCards = async () => {
    return prisma.hotelCard.findMany({
        where: {
            isActive: true,
        },
        orderBy: {
            sortOrder: 'asc',
        },
    });
};
export const findHotelCardsByCity = async (city) => {
    return prisma.hotelCard.findMany({
        where: {
            city,
            isActive: true,
        },
        orderBy: {
            sortOrder: 'asc',
        },
    });
};
//# sourceMappingURL=hotelCard.service.js.map
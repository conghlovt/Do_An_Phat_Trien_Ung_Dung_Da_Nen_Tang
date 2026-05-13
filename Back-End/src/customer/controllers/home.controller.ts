import type { Request, Response } from 'express';
import prisma  from '../../login/lib/prisma';

export const getHotelSections = async (req: Request, res: Response) => {
  try {
    const [
      flashSaleHourly,
      flashSaleOvernight,
      specialOffers,
      stayHubSuggest,
      topRated,
      newHotels,
    ] = await Promise.all([
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

    return res.status(200).json({
      flashSaleHourly,
      flashSaleOvernight,
      specialOffers,
      stayHubSuggest,
      topRated,
      newHotels,
    });
  } catch (error) {
    console.error('Lỗi lấy dữ liệu hotel sections:', error);
    return res.status(500).json({
      message: 'Không thể tải dữ liệu khách sạn',
    });
  }
};
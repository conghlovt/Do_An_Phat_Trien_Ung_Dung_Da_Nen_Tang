import type { Request, Response } from 'express';
import prisma  from '../../login/lib/prisma';

export const getHotelCards = async (req: Request, res: Response) => {
  try {
    const hotelCards = await prisma.hotelCard.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return res.status(200).json(hotelCards);
  } catch (error) {
    console.error('Lỗi lấy hotel cards:', error);
    return res.status(500).json({
      message: 'Không thể tải danh sách khách sạn',
    });
  }
};

export const getHotelCardsByCity = async (req: Request, res: Response) => {
  try {
    const { city } = req.params as { city: string };

    const hotelCards = await prisma.hotelCard.findMany({
      where: {
        ...(city && { city }),
        isActive: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return res.status(200).json(hotelCards);
  } catch (error) {
    console.error('Lỗi lấy hotel cards theo thành phố:', error);
    return res.status(500).json({
      message: 'Không thể tải danh sách khách sạn theo thành phố',
    });
  }
};
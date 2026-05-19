import type { Request, Response } from 'express';
import * as homeService from '../services/home.service';

export const getHotelSections = async (req: Request, res: Response) => {
  try {
    const sections = await homeService.findHotelSections();
    return res.status(200).json(sections);
  } catch (error) {
    console.error('Lỗi lấy dữ liệu hotel sections:', error);
    return res.status(500).json({
      message: 'Không thể tải dữ liệu khách sạn',
    });
  }
};

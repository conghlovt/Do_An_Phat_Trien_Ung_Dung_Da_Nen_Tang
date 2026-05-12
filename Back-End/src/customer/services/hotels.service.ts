import prisma from '../../login/lib/prisma';
import type { HotelQueryParams } from '../models/hotel.model';
import { AppError } from '../../shared/errors/AppError';

export const findHotels = async (params: HotelQueryParams) => {
  const { tag, sort, minPrice, maxPrice, district, limit } = params;

  const where: any = {};

  if (district) {
    where.district = { contains: district, mode: 'insensitive' };
  }
  if (minPrice || maxPrice) {
    where.priceValue = {
      ...(minPrice ? { gte: Number(minPrice) } : {}),
      ...(maxPrice ? { lte: Number(maxPrice) } : {}),
    };
  }
  if (tag) {
    where.tags = { has: tag };
  }

  let orderBy: any = { id: 'asc' };
  if (sort === 'rating')      orderBy = { rating: 'desc' };
  if (sort === 'price-asc')   orderBy = { priceValue: 'asc' };
  if (sort === 'price-desc')  orderBy = { priceValue: 'desc' };

  const take = limit ? Math.min(Number(limit), 50) : 20;

  const [hotels, total] = await Promise.all([
    prisma.hotel.findMany({ where, orderBy, take }),
    prisma.hotel.count({ where }),
  ]);

  return { hotels, total };
};

export const findHotelById = async (id: string) => {
  const hotel = await prisma.hotel.findUnique({ where: { id } });
  if (!hotel) {
    throw new AppError(404, 'HOTEL_NOT_FOUND', 'Không tìm thấy khách sạn');
  }
  return hotel;
};

export const getOfficeInfo = () => ({
  title:     'Văn phòng chính StayHub',
  address:   'Tầng 12, Tòa nhà Bitexco, Số 2 Hải Triều, P. Bến Nghé, Quận 1, TP.HCM',
  phone:     '1900 1234',
  email:     'support@stayhub.com',
  latitude:  10.7769,
  longitude: 106.6966,
  hours:     { weekday: '08:00 - 22:00', weekend: '09:00 - 21:00' },
});

import prisma from '../../login/lib/prisma';
import type { HotelQueryParams, LocationProvince } from '../models/hotel.model';
import { AppError } from '../../shared/errors/AppError';
import { CUSTOMER_OFFICE_INFO } from '../constants/office.constants';
import { buildLocationTree } from '../utils/locationTree.util';
import { attachRoomAmenities, findHotelIdsByRoomAmenities, parseRoomAmenities } from '../utils/roomAmenities.util';
import { normalizeName } from '../utils/text.util';

export const findHotels = async (params: HotelQueryParams) => {
  const { tag, sort, minPrice, maxPrice, district, limit, roomAmenities } = params;
  const selectedRoomAmenities = parseRoomAmenities(roomAmenities);

  const where: any = {
    isActive: true,
  };

  const matchingHotelIds = await findHotelIdsByRoomAmenities(selectedRoomAmenities);
  if (matchingHotelIds) {
    where.id = { in: matchingHotelIds };
  }

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
    prisma.hotelCard.findMany({ where, orderBy, take }),
    prisma.hotelCard.count({ where }),
  ]);

  return { hotels: await attachRoomAmenities(hotels), total };
};

export const findHotelById = async (id: string) => {
  const hotel = await prisma.hotelCard.findFirst({ where: { id, isActive: true } });
  if (!hotel) {
    throw new AppError(404, 'HOTEL_NOT_FOUND', 'Không tìm thấy khách sạn');
  }
  const [hotelWithRoomAmenities] = await attachRoomAmenities([hotel]);
  return hotelWithRoomAmenities;
};

export const findHotelLocations = async (): Promise<LocationProvince[]> => {
  const hotelAddressRows = await prisma.hotelAddress.findMany({
    where: {
      hotel: {
        status: 'approved',
        propertyType: { in: ['hotel', 'homestay'] },
      },
    },
    select: {
      province: true,
      city: true,
      district: true,
      ward: true,
    },
  });

  const addressLocations = buildLocationTree(
    hotelAddressRows.map((row) => ({
      province: normalizeName(row.province) || normalizeName(row.city),
      district: row.district,
      ward: row.ward ?? undefined,
    }))
  );

  if (addressLocations.length > 0) {
    return addressLocations;
  }

  const hotelCardRows = await prisma.hotelCard.findMany({
    where: { isActive: true },
    select: {
      city: true,
      district: true,
      area: true,
    },
  });

  return buildLocationTree(
    hotelCardRows.map((row) => ({
      province: row.city,
      district: row.district || row.area,
    }))
  );
};

export const getOfficeInfo = () => CUSTOMER_OFFICE_INFO;

import prisma from '../../login/lib/prisma';
import type { HotelQueryParams, LocationProvince } from '../models/hotel.model';
import { AppError } from '../../shared/errors/AppError';
import { CUSTOMER_OFFICE_INFO } from '../constants/office.constants';
import { buildLocationTree } from '../utils/locationTree.util';
import { attachRoomAmenities, findHotelIdsByRoomAmenities, parseRoomAmenities } from '../utils/roomAmenities.util';
import { normalizeName, textMatches } from '../utils/text.util';

type HotelSearchCandidate = {
  name?: string | null;
  city?: string | null;
  district?: string | null;
  area?: string | null;
  location?: string | null;
};

const matchesHotelKeyword = (hotel: HotelSearchCandidate, keyword?: string) => {
  if (!keyword) return true;

  return textMatches(hotel.name, keyword) ||
    [
      hotel.city,
      hotel.district,
      hotel.area,
      hotel.location,
    ].some((value) => textMatches(value, keyword, { stripAdministrativeWords: true }));
};

export const findHotels = async (params: HotelQueryParams) => {
  const { keyword, tag, sort, minPrice, maxPrice, district, limit, roomAmenities } = params;
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

  if (keyword) {
    const hotels = await prisma.hotelCard.findMany({ where, orderBy });
    const matchedHotels = hotels.filter((hotel) => matchesHotelKeyword(hotel, keyword));
    const pagedHotels = matchedHotels.slice(0, take);

    return { hotels: await attachRoomAmenities(pagedHotels), total: matchedHotels.length };
  }

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

export const findViewedHotels = async (userId: string) => {
  const viewedRows = await prisma.customerViewedHotel.findMany({
    where: {
      userId,
      hotel: { isActive: true },
    },
    include: { hotel: true },
    orderBy: { viewedAt: 'desc' },
    take: 12,
  });

  return attachRoomAmenities(viewedRows.map((row) => row.hotel));
};

export const saveViewedHotel = async (userId: string, hotelId: string) => {
  await findHotelById(hotelId);

  await prisma.customerViewedHotel.upsert({
    where: {
      userId_hotelId: {
        userId,
        hotelId,
      },
    },
    update: { viewedAt: new Date() },
    create: {
      userId,
      hotelId,
    },
  });
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

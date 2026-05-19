import prisma from '../../login/lib/prisma';
import type { HotelQueryParams, LocationProvince } from '../models/hotel.model';
import { AppError } from '../../shared/errors/AppError';

const compareVietnamese = (a: string, b: string) => a.localeCompare(b, 'vi', { sensitivity: 'base' });

const normalizeName = (value: string | null | undefined) => value?.replace(/\s+/g, ' ').trim() ?? '';

type LocationRow = {
  province: string;
  district: string;
  ward?: string | undefined;
};

const buildLocationTree = (rows: LocationRow[]): LocationProvince[] => {
  const provinceMap = new Map<string, {
    count: number;
    districts: Map<string, { count: number; wards: Map<string, number> }>;
  }>();

  rows.forEach((row) => {
    const provinceName = normalizeName(row.province);
    const districtName = normalizeName(row.district);
    const wardName = normalizeName(row.ward);

    if (!provinceName || !districtName) return;

    if (!provinceMap.has(provinceName)) {
      provinceMap.set(provinceName, { count: 0, districts: new Map() });
    }

    const province = provinceMap.get(provinceName);
    if (!province) return;
    province.count += 1;

    if (!province.districts.has(districtName)) {
      province.districts.set(districtName, { count: 0, wards: new Map() });
    }

    const district = province.districts.get(districtName);
    if (!district) return;
    district.count += 1;

    if (wardName) {
      district.wards.set(wardName, (district.wards.get(wardName) ?? 0) + 1);
    }
  });

  return Array.from(provinceMap.entries())
    .map(([name, province]) => ({
      name,
      count: province.count,
      districts: Array.from(province.districts.entries())
        .map(([districtName, district]) => ({
          name: districtName,
          count: district.count,
          wards: Array.from(district.wards.entries())
            .map(([wardName, count]) => ({ name: wardName, count }))
            .sort((a, b) => compareVietnamese(a.name, b.name)),
        }))
        .sort((a, b) => compareVietnamese(a.name, b.name)),
    }))
    .filter((province) => province.count > 0)
    .sort((a, b) => compareVietnamese(a.name, b.name));
};

export const findHotels = async (params: HotelQueryParams) => {
  const { tag, sort, minPrice, maxPrice, district, limit } = params;

  const where: any = {
    isActive: true,
  };

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

  return { hotels, total };
};

export const findHotelById = async (id: string) => {
  const hotel = await prisma.hotelCard.findFirst({ where: { id, isActive: true } });
  if (!hotel) {
    throw new AppError(404, 'HOTEL_NOT_FOUND', 'Không tìm thấy khách sạn');
  }
  return hotel;
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

export const getOfficeInfo = () => ({
  title:     'Văn phòng chính StayHub',
  address:   'Tầng 12, Tòa nhà Bitexco, Số 2 Hải Triều, P. Bến Nghé, Quận 1, TP.HCM',
  phone:     '1900 1234',
  email:     'support@stayhub.com',
  latitude:  10.7769,
  longitude: 106.6966,
  hours:     { weekday: '08:00 - 22:00', weekend: '09:00 - 21:00' },
});

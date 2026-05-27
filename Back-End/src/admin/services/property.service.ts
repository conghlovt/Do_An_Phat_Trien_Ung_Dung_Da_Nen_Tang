import { Prisma, type Hotel, type Property, type HotelAddress } from '@prisma/client';
import prisma from '../../login/lib/prisma';
import { AppError } from '../../shared/utils/app-error.util';
import {
  mapHotelStatusToPropertyStatus,
  syncHotelMirror,
} from '../../shared/services/lodging-sync.service';
import { buildListResult, type DateRange, type SortOrder } from '../utils/admin-query.util';

const hotelInclude = {
  address: true,
  owner: { select: { username: true, email: true } },
  _count: { select: { roomTypes: true } },
} satisfies Prisma.HotelInclude;

type HotelWithInclude = Prisma.HotelGetPayload<{ include: typeof hotelInclude }>;

const makeNotFoundError = (message: string) =>
  new AppError(404, 'RESOURCE_NOT_FOUND', { userMessage: message });

const makeValidationError = (message: string) =>
  new AppError(400, 'VALIDATION_ERROR', { userMessage: message });

const normalizeHotelStatusInput = (status?: string) => {
  const value = String(status || '').trim();
  const lower = value.toLowerCase();
  if (lower === 'active' || lower === 'approved') return 'approved';
  if (lower === 'inactive' || lower === 'suspended') return 'suspended';
  if (lower === 'pending') return 'pending';
  if (lower === 'draft') return 'draft';
  if (lower === 'rejected') return 'rejected';
  throw makeValidationError('Trang thai co so luu tru khong hop le.');
};

const normalizePropertyTypeInput = (type?: string) => {
  const value = String(type || 'hotel').trim().toLowerCase();
  if (['hotel', 'homestay', 'resort', 'motel', 'apartment'].includes(value)) return value;
  return 'hotel';
};

const getHotelAddressText = (hotel: HotelWithInclude) =>
  hotel.address?.fullAddress ||
  hotel.address?.addressLine ||
  [hotel.address?.ward, hotel.address?.district, hotel.address?.city, hotel.address?.province]
    .filter(Boolean)
    .join(', ') ||
  hotel.name;

const getHotelCity = (hotel: HotelWithInclude) =>
  hotel.address?.city || hotel.address?.province || 'Chua cap nhat';

const normalizeHotel = (hotel: HotelWithInclude) => ({
  id: hotel.id,
  name: hotel.name,
  description: hotel.description,
  address: getHotelAddressText(hotel),
  city: getHotelCity(hotel),
  type: hotel.propertyType,
  status: hotel.status,
  propertyStatus: mapHotelStatusToPropertyStatus(hotel.status),
  source: 'hotel',
  roomCount: (hotel as any)._count?.roomTypes ?? (hotel as any).roomTypes?.length ?? 0,
  totalRooms: hotel.totalRooms,
  rejectionReason: hotel.rejectionReason,
  approvedAt: hotel.approvedAt,
  createdAt: hotel.createdAt,
  owner: hotel.owner,
});

const normalizeProperty = (property: Property & { owner: { username: string; email: string } }) => ({
  ...property,
  source: 'property',
  propertyStatus: property.status,
});

export type AdminPropertyListOptions = {
  q?: string | undefined;
  search?: string | undefined;
  status?: string | undefined;
  city?: string | undefined;
  propertyType?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
  sortBy?: string | undefined;
  sortOrder?: SortOrder | undefined;
  dateRange?: DateRange | undefined;
  paginate?: boolean | undefined;
};

const lodgingSortFields = new Set(['createdAt', 'updatedAt', 'name', 'status']);

const normalizeHotelStatusFilter = (status?: string) => {
  const value = String(status || '').trim().toLowerCase();
  if (!value || value === 'all') return undefined;
  if (value === 'active' || value === 'approved') return 'approved';
  if (value === 'pending') return 'pending';
  if (value === 'inactive' || value === 'suspended') return 'suspended';
  if (value === 'rejected') return 'rejected';
  if (value === 'draft') return 'draft';
  return undefined;
};

const normalizeLegacyPropertyStatusFilter = (status?: string) => {
  const value = String(status || '').trim().toLowerCase();
  if (!value || value === 'all') return undefined;
  if (value === 'active' || value === 'approved') return 'ACTIVE';
  if (value === 'pending' || value === 'draft') return 'PENDING';
  if (value === 'inactive' || value === 'suspended' || value === 'rejected') return 'INACTIVE';
  return undefined;
};

const buildLodgingOrderBy = (sortBy?: string, sortOrder: SortOrder = 'desc') => ({
  [lodgingSortFields.has(String(sortBy || '')) ? String(sortBy) : 'createdAt']: sortOrder,
});

const buildHotelWhere = (options: AdminPropertyListOptions): Prisma.HotelWhereInput => {
  const query = String(options.search || options.q || '').trim();
  const where: Prisma.HotelWhereInput = {};
  const status = normalizeHotelStatusFilter(options.status);

  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { owner: { username: { contains: query, mode: 'insensitive' } } },
      { owner: { email: { contains: query, mode: 'insensitive' } } },
      { address: { is: { fullAddress: { contains: query, mode: 'insensitive' } } } },
      { address: { is: { addressLine: { contains: query, mode: 'insensitive' } } } },
      { address: { is: { city: { contains: query, mode: 'insensitive' } } } },
      { address: { is: { province: { contains: query, mode: 'insensitive' } } } },
      { address: { is: { district: { contains: query, mode: 'insensitive' } } } },
    ];
  }

  if (status) where.status = status as any;
  if (options.propertyType) where.propertyType = String(options.propertyType).toLowerCase() as any;
  if (options.city) {
    where.address = {
      is: {
        OR: [
          { city: { contains: options.city, mode: 'insensitive' } },
          { province: { contains: options.city, mode: 'insensitive' } },
        ],
      },
    } as any;
  }
  if (options.dateRange?.from || options.dateRange?.to) {
    where.createdAt = {
      ...(options.dateRange.from ? { gte: options.dateRange.from } : {}),
      ...(options.dateRange.to ? { lte: options.dateRange.to } : {}),
    };
  }

  return where;
};

const buildLegacyPropertyWhere = (
  options: AdminPropertyListOptions,
  mirroredHotelIds: string[],
): Prisma.PropertyWhereInput => {
  const query = String(options.search || options.q || '').trim();
  const status = normalizeLegacyPropertyStatusFilter(options.status);
  const where: Prisma.PropertyWhereInput = {
    ...(mirroredHotelIds.length ? { id: { notIn: mirroredHotelIds } } : {}),
  };

  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { address: { contains: query, mode: 'insensitive' } },
      { city: { contains: query, mode: 'insensitive' } },
      { type: { contains: query, mode: 'insensitive' } },
      { owner: { username: { contains: query, mode: 'insensitive' } } },
      { owner: { email: { contains: query, mode: 'insensitive' } } },
    ];
  }

  if (status) where.status = status as any;
  if (options.city) where.city = { contains: options.city, mode: 'insensitive' };
  if (options.propertyType) where.type = { contains: options.propertyType, mode: 'insensitive' };
  if (options.dateRange?.from || options.dateRange?.to) {
    where.createdAt = {
      ...(options.dateRange.from ? { gte: options.dateRange.from } : {}),
      ...(options.dateRange.to ? { lte: options.dateRange.to } : {}),
    };
  }

  return where;
};


export const propertyService = {
  getProperties: async (options: AdminPropertyListOptions = {}) => {
    const { page = 1, limit = 10, paginate = true } = options;
    const skip = (page - 1) * limit;
    const windowSize = paginate ? skip + limit : undefined;
    const hotelWhere = buildHotelWhere(options);
    const allMirroredHotelIds = await prisma.hotel.findMany({ select: { id: true } });
    const legacyWhere = buildLegacyPropertyWhere(options, allMirroredHotelIds.map((hotel) => hotel.id));
    const orderBy = buildLodgingOrderBy(options.sortBy, options.sortOrder) as any;

    const [hotels, legacyProperties, hotelTotal, legacyTotal] = await Promise.all([
      prisma.hotel.findMany({
        where: hotelWhere as any,
        include: hotelInclude,
        orderBy,
        ...(windowSize ? { take: windowSize } : {}),
      }),
      prisma.property.findMany({
        where: legacyWhere,
        include: {
          owner: { select: { username: true, email: true } },
        },
        orderBy,
        ...(windowSize ? { take: windowSize } : {}),
      }),
      prisma.hotel.count({ where: hotelWhere as any }),
      prisma.property.count({ where: legacyWhere }),
    ]);

    const items = [
      ...hotels.map(normalizeHotel),
      ...legacyProperties.map((p: any) => normalizeProperty(p)),
    ].sort((a: any, b: any) => {
      const field = lodgingSortFields.has(String(options.sortBy || '')) ? String(options.sortBy) : 'createdAt';
      const av = a[field] instanceof Date ? a[field].getTime() : String(a[field] || '');
      const bv = b[field] instanceof Date ? b[field].getTime() : String(b[field] || '');
      if (av === bv) return 0;
      return options.sortOrder === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

    const pagedItems = paginate ? items.slice(skip, skip + limit) : items;
    return buildListResult('properties', pagedItems, page, limit, hotelTotal + legacyTotal);
  },

  updateProperty: async (id: string, data: any) => {
    const hotel = await prisma.hotel.findUnique({ where: { id }, include: { address: true } });
    if (hotel) {
      const updatedHotel = await prisma.$transaction(async (tx: any) => {
        await tx.hotel.update({
          where: { id },
          data: {
            ...(data.name !== undefined ? { name: data.name } : {}),
            ...(data.description !== undefined ? { description: data.description } : {}),
            ...(data.type !== undefined ? { propertyType: normalizePropertyTypeInput(data.type) } : {}),
          } as any,
        });

        if (data.address !== undefined || data.city !== undefined) {
          const addressLine = String(data.address || hotel.address?.addressLine || hotel.name);
          const city = String(data.city || hotel.address?.city || 'Chua cap nhat');
          const district = String(data.district || hotel.address?.district || city);
          await tx.hotelAddress.upsert({
            where: { hotelId: id },
            update: {
              addressLine,
              city,
              district,
              province: data.province || hotel.address?.province || city,
              fullAddress: addressLine,
            },
            create: {
              hotelId: id,
              addressLine,
              city,
              district,
              province: data.province || city,
              fullAddress: addressLine,
            },
          });
        }

        if (data.status !== undefined) {
          const status = normalizeHotelStatusInput(data.status);
          await tx.hotel.update({
            where: { id },
            data: { status },
          } as any);
        }

        await syncHotelMirror(tx as any, id);
        return tx.hotel.findUnique({
          where: { id },
          include: hotelInclude,
        });
      });

      if (!updatedHotel) throw makeNotFoundError('Khong tim thay khach san sau khi cap nhat.');
      return normalizeHotel(updatedHotel);
    }

    const { name, description, address, city, type, status } = data;
    const property = await prisma.property.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(address !== undefined ? { address } : {}),
        ...(city !== undefined ? { city } : {}),
        ...(type !== undefined ? { type } : {}),
        ...(status !== undefined ? { status: status as any } : {}),
      },
      include: { owner: { select: { username: true, email: true } } },
    });
    return normalizeProperty(property);
  },

  updatePropertyStatus: async (
    id: string,
    statusInput: string,
    adminId?: string,
    rejectionReason?: string,
  ) => {
    const status = normalizeHotelStatusInput(statusInput);
    const hotel = await prisma.hotel.findUnique({ where: { id } });

    if (hotel) {
      const updatedHotel = await prisma.$transaction(async (tx: any) => {
        await tx.hotel.update({
          where: { id },
          data: {
            status,
            ...(status === 'approved' ? { approvedAt: new Date(), approvedBy: adminId || null, rejectionReason: null } : {}),
            ...(status === 'rejected' ? { rejectionReason: rejectionReason || 'Rejected by admin' } : {}),
            ...(status === 'suspended' ? { rejectionReason: rejectionReason || hotel.rejectionReason } : {}),
          } as any,
        });

        await syncHotelMirror(tx as any, id);
        return tx.hotel.findUnique({
          where: { id },
          include: hotelInclude,
        });
      });

      if (!updatedHotel) throw makeNotFoundError('Khong tim thay khach san sau khi cap nhat.');
      return normalizeHotel(updatedHotel);
    }

    const propertyStatus = mapHotelStatusToPropertyStatus(status);
    const property = await prisma.property.update({
      where: { id },
      data: { status: propertyStatus as any },
      include: { owner: { select: { username: true, email: true } } },
    });

    return normalizeProperty(property);
  },

  deleteProperty: async (id: string) => {
    const hotel = await prisma.hotel.findUnique({ where: { id } });
    if (hotel) {
      await prisma.$transaction(async (tx: any) => {
        await tx.hotel.update({
          where: { id },
          data: { status: 'suspended' },
        });
        await syncHotelMirror(tx as any, id);
      });
      return;
    }

    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) throw makeNotFoundError('Khong tim thay co so luu tru.');

    await prisma.$transaction(async (tx: any) => {
      const rooms = await tx.room.findMany({ where: { propertyId: id }, select: { id: true } });
      const roomIds = rooms.map((room: any) => room.id);
      const bookings = roomIds.length
        ? await tx.booking.findMany({ where: { roomId: { in: roomIds } }, select: { id: true } })
        : [];
      const bookingIds = bookings.map((booking: any) => booking.id);

      if (bookingIds.length) {
        await tx.review.deleteMany({ where: { bookingId: { in: bookingIds } } });
        await tx.booking.deleteMany({ where: { id: { in: bookingIds } } });
      }
      if (roomIds.length) {
        await tx.room.deleteMany({ where: { id: { in: roomIds } } });
      }
      await tx.property.delete({ where: { id } });
    });
  },
};

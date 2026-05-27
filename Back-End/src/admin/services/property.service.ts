import prisma from '../../login/lib/prisma';
import { AppError } from '../../shared/utils/app-error.util';
import {
  mapHotelStatusToPropertyStatus,
  syncHotelMirror,
} from '../../shared/services/lodging-sync.service';

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

const getHotelAddressText = (hotel: any) =>
  hotel.address?.fullAddress ||
  hotel.address?.addressLine ||
  [hotel.address?.ward, hotel.address?.district, hotel.address?.city, hotel.address?.province]
    .filter(Boolean)
    .join(', ') ||
  hotel.name;

const getHotelCity = (hotel: any) =>
  hotel.address?.city || hotel.address?.province || 'Chua cap nhat';

const normalizeHotel = (hotel: any) => ({
  id: hotel.id,
  name: hotel.name,
  description: hotel.description,
  address: getHotelAddressText(hotel),
  city: getHotelCity(hotel),
  type: hotel.propertyType,
  status: hotel.status,
  propertyStatus: mapHotelStatusToPropertyStatus(hotel.status),
  source: 'hotel',
  roomCount: hotel._count?.roomTypes ?? hotel.roomTypes?.length ?? 0,
  totalRooms: hotel.totalRooms,
  rejectionReason: hotel.rejectionReason,
  approvedAt: hotel.approvedAt,
  createdAt: hotel.createdAt,
  owner: hotel.owner,
});

const normalizeProperty = (property: any) => ({
  ...property,
  source: 'property',
  propertyStatus: property.status,
});

const hotelInclude = {
  address: true,
  owner: { select: { username: true, email: true } },
  _count: { select: { roomTypes: true } },
};

export const propertyService = {
  getProperties: async (options: { q?: string }) => {
    const { q } = options;
    const hotelWhere = q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { address: { is: { fullAddress: { contains: q, mode: 'insensitive' } } } },
            { address: { is: { city: { contains: q, mode: 'insensitive' } } } },
            { address: { is: { district: { contains: q, mode: 'insensitive' } } } },
          ],
        }
      : {};

    const hotels = await prisma.hotel.findMany({
      where: hotelWhere as any,
      include: hotelInclude,
      orderBy: { createdAt: 'desc' },
    });

    const hotelIds = hotels.map((hotel) => hotel.id);
    const legacyProperties = await prisma.property.findMany({
      where: {
        ...(hotelIds.length ? { id: { notIn: hotelIds } } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { address: { contains: q, mode: 'insensitive' } },
                { city: { contains: q, mode: 'insensitive' } },
                { type: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      } as any,
      include: {
        owner: { select: { username: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    } as any);

    return [
      ...hotels.map(normalizeHotel),
      ...legacyProperties.map(normalizeProperty),
    ];
  },

  updateProperty: async (id: string, data: any) => {
    const hotel = await prisma.hotel.findUnique({ where: { id }, include: { address: true } });
    if (hotel) {
      const updatedHotel = await prisma.$transaction(async (tx) => {
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

        await syncHotelMirror(tx, id);
        return tx.hotel.findUnique({
          where: { id },
          include: hotelInclude,
        });
      });

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
      const updatedHotel = await prisma.$transaction(async (tx) => {
        await tx.hotel.update({
          where: { id },
          data: {
            status,
            ...(status === 'approved' ? { approvedAt: new Date(), approvedBy: adminId || null, rejectionReason: null } : {}),
            ...(status === 'rejected' ? { rejectionReason: rejectionReason || 'Rejected by admin' } : {}),
            ...(status === 'suspended' ? { rejectionReason: rejectionReason || hotel.rejectionReason } : {}),
          } as any,
        });

        await syncHotelMirror(tx, id);
        return tx.hotel.findUnique({
          where: { id },
          include: hotelInclude,
        });
      });

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
      await prisma.$transaction(async (tx) => {
        await tx.hotel.update({
          where: { id },
          data: { status: 'suspended' },
        });
        await syncHotelMirror(tx, id);
      });
      return;
    }

    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) throw makeNotFoundError('Khong tim thay co so luu tru.');

    await prisma.$transaction(async (tx) => {
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

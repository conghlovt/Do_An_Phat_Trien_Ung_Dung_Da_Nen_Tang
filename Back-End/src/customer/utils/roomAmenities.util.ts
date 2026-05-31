import prisma from '../../login/lib/prisma';
import { normalizeName, normalizeSearch } from './text.util';

export const parseRoomAmenities = (value: string | undefined) =>
  (value ?? '')
    .split(',')
    .map((item) => normalizeName(item))
    .filter(Boolean);

export const findHotelIdsByRoomAmenities = async (amenities: string[]) => {
  if (amenities.length === 0) return undefined;

  const hotels = await prisma.hotel.findMany({
    where: { status: 'approved' },
    select: {
      id: true,
      hotelAmenities: {
        select: {
          amenity: {
            select: { name: true },
          },
        },
      },
      roomTypes: {
        where: { status: 'active' },
        select: {
          roomTypeAmenities: {
            select: {
              amenity: {
                select: { name: true },
              },
            },
          },
        },
      },
    },
  });

  const selected = amenities.map(normalizeSearch);
  const matchedHotelIds = new Set<string>();

  hotels.forEach((hotel) => {
    const amenityNames = [
      ...hotel.hotelAmenities.map((item) => item.amenity.name),
      ...hotel.roomTypes.flatMap((roomType) =>
        roomType.roomTypeAmenities.map((item) => item.amenity.name),
      ),
    ];

    const hotelAmenities = amenityNames.map(normalizeSearch);
    const hasAllAmenities = selected.every((amenity) =>
      hotelAmenities.some((hotelAmenity) => hotelAmenity.includes(amenity) || amenity.includes(hotelAmenity)),
    );

    if (hasAllAmenities) matchedHotelIds.add(hotel.id);
  });

  return Array.from(matchedHotelIds);
};

export const attachRoomAmenities = async <T extends { id: string }>(hotels: T[]) => {
  if (hotels.length === 0) return hotels;

  const hotelIds = hotels.map((hotel) => hotel.id);
  const [hotelAmenities, roomTypes] = await Promise.all([
    prisma.hotel.findMany({
      where: {
        id: { in: hotelIds },
        status: 'approved',
      },
      select: {
        id: true,
        propertyType: true,
        hotelAmenities: {
          select: {
            amenity: {
              select: { name: true },
            },
          },
        },
      },
    }),
    prisma.roomType.findMany({
      where: {
        hotelId: { in: hotelIds },
        status: 'active',
      },
      select: {
        hotelId: true,
        roomTypeAmenities: {
          select: {
            amenity: {
              select: { name: true },
            },
          },
        },
      },
    }),
  ]);

  const hotelAmenityMap = new Map<string, Set<string>>();
  const hotelPropertyTypeMap = new Map<string, string>();
  const roomAmenityMap = new Map<string, Set<string>>();

  hotelAmenities.forEach((hotel) => {
    hotelPropertyTypeMap.set(hotel.id, hotel.propertyType);

    if (!hotelAmenityMap.has(hotel.id)) {
      hotelAmenityMap.set(hotel.id, new Set());
    }

    const amenities = hotelAmenityMap.get(hotel.id);
    hotel.hotelAmenities.forEach((item) => amenities?.add(item.amenity.name));
  });

  roomTypes.forEach((roomType) => {
    if (!roomAmenityMap.has(roomType.hotelId)) {
      roomAmenityMap.set(roomType.hotelId, new Set());
    }

    const roomAmenities = roomAmenityMap.get(roomType.hotelId);
    roomType.roomTypeAmenities.forEach((item) => roomAmenities?.add(item.amenity.name));
  });

  return hotels.map((hotel) => ({
    ...hotel,
    propertyType: hotelPropertyTypeMap.get(hotel.id),
    amenities: Array.from(hotelAmenityMap.get(hotel.id) ?? []),
    roomAmenities: Array.from(roomAmenityMap.get(hotel.id) ?? []),
  }));
};

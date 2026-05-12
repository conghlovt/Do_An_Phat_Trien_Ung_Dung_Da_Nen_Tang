import prisma from '../../login/lib/prisma';
import type { Room } from '../models/room.model';
import { findHotelById } from './hotels.service';

export const findRoomsByHotelId = async (hotelId: string): Promise<Room[]> => {
  // Xác nhận khách sạn tồn tại
  await findHotelById(hotelId);

  // Lấy danh sách loại phòng thật từ DB theo Hotel
  const roomTypes = await prisma.roomType.findMany({
    where: {
      hotelId,
      status: 'active',
    },
    include: {
      media: {
        orderBy: {
          sortOrder: 'asc',
        },
      },
      pricingPolicies: {
        where: {
          isActive: true,
        },
      },
      roomTypeAmenities: {
        include: {
          amenity: true,
        },
      },
    },
    orderBy: {
      sortOrder: 'asc',
    },
  });

  return roomTypes.map((roomType: any) => {
    const coverImages = roomType.media
      .filter((item: any) => item.mediaType === 'image')
      .map((item: any) => item.imageUrl)
      .filter((url: any): url is string => Boolean(url));

    const firstPolicy = roomType.pricingPolicies[0];

    const price = firstPolicy ? Number(firstPolicy.basePrice) : 0;

    const amenities = roomType.roomTypeAmenities.map((item: any) => item.amenity.name);

    return {
      id: roomType.id,
      hotelId: roomType.hotelId,
      name: roomType.name,
      area: roomType.roomSizeSqm ? Number(roomType.roomSizeSqm) : 0,
      beds: roomType.bedType ?? 'Chưa cập nhật',
      maxGuests: roomType.maxGuests,
      images: coverImages,
      price,
      originalPrice: price,
      discountPercent: 0,
      flashSale: false,
      remainingRooms: roomType.totalUnits,
      paymentType: 'all',
      amenities,
    };
  });
};
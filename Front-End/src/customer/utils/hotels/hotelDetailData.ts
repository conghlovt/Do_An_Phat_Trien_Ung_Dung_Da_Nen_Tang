import type { Hotel } from '@/src/customer/types/hotels';

export function enrichHotel(hotel: Hotel): Hotel {
  return {
    ...hotel,
    images: hotel.images?.length ? hotel.images : [hotel.image].filter(Boolean),
    phone: hotel.phone,
    email: hotel.email || 'contact@stayhub.com',
    address: hotel.address,
    description: hotel.description ?? 'Thông tin giới thiệu đang được cập nhật.',
    amenities: hotel.amenities?.length ? hotel.amenities : [],
    checkInHour: { start: '08:00', end: '22:00' },
    checkInOvernight: { start: '22:00', end: '10:00' },
    checkInDay: { start: '14:00', end: '12:00' },
  };
}

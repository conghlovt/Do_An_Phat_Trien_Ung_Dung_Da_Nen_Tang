import type { Hotel } from '../types/hotels.types';
import type { ViewedHotel } from './viewedHotels';

export function toHotelFromViewed(hotel: ViewedHotel): Hotel {
  return {
    id: String(hotel.id),
    name: hotel.name,
    rating: hotel.rating ?? 4.9,
    reviews: hotel.reviews ?? 0,
    location: hotel.location ?? 'Khách sạn đã xem',
    district: hotel.district ?? '',
    discount: hotel.discount ?? 'Đã xem gần đây',
    price: hotel.price ?? 'Xem giá',
    priceValue: hotel.priceValue ?? 0,
    unit: hotel.unit ?? '',
    oldPrice: hotel.oldPrice ?? '',
    image: hotel.image,
    badge: hotel.badge ?? 'Đã xem',
    tags: hotel.tags ?? ['Đã xem'],
    images: hotel.images,
  };
}

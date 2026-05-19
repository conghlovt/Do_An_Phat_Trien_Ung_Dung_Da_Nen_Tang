import type { Hotel } from '../types/hotels.types';

export interface HotelReview {
  id: number;
  name: string;
  tag: string;
  rating: number;
  text: string;
}

export interface SuggestedHotel {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  location: string;
  price: string;
  unit: string;
  discount: string;
  badge: string;
  image: string;
}

export function enrichHotel(hotel: Hotel): Hotel {
  return {
    ...hotel,
    images: [
      hotel.image,
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
    ],
    phone: '0845 795 656',
    address: 'Căn hộ số 30-N7B, Khu đô thị Trung Hòa-Nhân Chính, phường Nhân Chính, quận Thanh Xuân, Hà Nội',
    description: 'Mọi vấn đề liên quan đến khách sạn, quý khách vui lòng gọi điện theo số hotline của chúng tôi.',
    amenities: ['WiFi', 'Điều hòa', 'TV', 'Bồn tắm', 'Cà phê'],
    checkInHour: { start: '08:00', end: '22:00' },
    checkInOvernight: { start: '22:00', end: '10:00' },
    checkInDay: { start: '14:00', end: '12:00' },
  };
}

export const HOTEL_REVIEWS: HotelReview[] = [
  { id: 1, name: 'Ninh', tag: 'ALL ROOM', rating: 5, text: 'Phòng sạch sẽ, thơm tho' },
  { id: 2, name: 'An', tag: 'LOVE ROOM', rating: 5, text: 'Phòng đẹp, nhân viên thân thiện, sẽ quay lại' },
  { id: 3, name: 'Minh', tag: 'ALL ROOM', rating: 4, text: 'Giá tốt, vị trí thuận tiện' },
];

export const SUGGESTED_HOTELS: SuggestedHotel[] = [
  {
    id: 10,
    name: 'Vy House Hotel',
    rating: 4.9,
    reviews: 1153,
    location: 'Thanh Xuân',
    price: '250.000đ',
    unit: '/ 2 giờ',
    discount: 'Mã giảm 28K',
    badge: 'Gợi ý',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400',
  },
  {
    id: 11,
    name: 'Lavie Hotel',
    rating: 4.9,
    reviews: 1307,
    location: 'Thanh Xuân',
    price: '199.000đ',
    unit: '/ 2 giờ',
    discount: 'Flash Sale',
    badge: 'Flash Sale',
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400',
  },
];

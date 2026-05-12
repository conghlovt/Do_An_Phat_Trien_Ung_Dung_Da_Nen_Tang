export type BookingType = 'Theo giờ' | 'Qua đêm' | 'Theo ngày';

// ─── Hotel ───────────────────────────────────────────────────────────────────

export interface Hotel {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  location: string;
  district: string;
  discount: string;
  price: string;
  priceValue: number;
  unit: string;
  oldPrice: string;
  image: string;
  badge: string;
  tags: string[];
  // Extended fields (thêm khi backend bổ sung)
  images?: string[];
  phone?: string;
  address?: string;
  description?: string;
  amenities?: string[];
  checkInHour?: { start: string; end: string };
  checkInOvernight?: { start: string; end: string };
  checkInDay?: { start: string; end: string };
}

export interface HotelsParams {
  tag?: string;
  sort?: 'relevant' | 'rating' | 'price-asc' | 'price-desc';
  minPrice?: number;
  maxPrice?: number;
  district?: string;
  limit?: number;
}

export interface HotelsResponse {
  data: Hotel[];
  total: number;
}

// ─── Room ────────────────────────────────────────────────────────────────────

export interface Room {
  id: string;
  hotelId: string;
  name: string;
  area: number;
  beds: string;
  maxGuests: number;
  images: string[];
  price: number;
  originalPrice: number;
  discountPercent?: number;
  flashSale: boolean;
  remainingRooms: number;
  paymentType: 'prepaid' | 'all';
  amenities?: string[];
}

export interface RoomsParams {
  bookingType?: BookingType;
  date?: string;
}

// ─── Availability ─────────────────────────────────────────────────────────────

export interface TimeSlot {
  time: string;
  available: boolean;
  maxHours?: number;
}

export interface AvailabilityParams {
  bookingType: BookingType;
  date: string;
}

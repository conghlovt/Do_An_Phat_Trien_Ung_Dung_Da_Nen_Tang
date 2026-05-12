// Type definitions cho Room model
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
  amenities: string[];
}

export interface AvailabilitySlot {
  time: string;
  available: boolean;
  maxHours: number | null;
}

export interface AvailabilityQueryParams {
  bookingType?: string;
  date?: string;
}

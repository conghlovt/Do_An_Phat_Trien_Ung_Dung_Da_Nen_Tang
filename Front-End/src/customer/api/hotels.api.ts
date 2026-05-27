import apiInstance from '@/src/customer/core/api/api.instance';
import type {
  Hotel,
  HotelsParams,
  HotelsResponse,
  Room,
  RoomsParams,
  TimeSlot,
  AvailabilityParams,
  OfficeInfo,
} from '@/src/customer/types/hotels.types';

export type {
  Hotel,
  HotelsParams,
  HotelsResponse,
  Room,
  RoomsParams,
  TimeSlot,
  AvailabilityParams,
  OfficeInfo,
};

export type { BookingType } from '@/src/customer/types/hotels.types';

export interface HotelReview {
  id: string | number;
  name: string;
  rating: number;
  text: string;
  tag?: string;
  createdAt?: string;
}

const BASE = '/api/customer/hotels';

export const hotelsApi = {
  getAll: async (params?: HotelsParams): Promise<HotelsResponse> => {
    const res = await apiInstance.get<HotelsResponse>(BASE, { params });
    return res.data;
  },

  getById: async (id: number | string): Promise<{ data: Hotel }> => {
    const hotelId = String(id);

    if (!hotelId || hotelId === 'NaN') {
      throw new Error('Valid hotel id is required');
    }

    const res = await apiInstance.get<{ data: Hotel }>(`${BASE}/${hotelId}`);
    return res.data;
  },

  getRooms: async (
    hotelId: number | string,
    params?: RoomsParams,
  ): Promise<{ data: Room[] }> => {
    const id = String(hotelId);

    if (!id || id === 'NaN') {
      throw new Error('Valid hotel id is required');
    }

    const res = await apiInstance.get<{ data: Room[] }>(
      `${BASE}/${id}/rooms`,
      { params },
    );

    return res.data;
  },

  getAvailability: async (
    hotelId: number | string,
    params: AvailabilityParams,
  ): Promise<{ data: TimeSlot[] }> => {
    const id = String(hotelId);

    if (!id || id === 'NaN') {
      throw new Error('Valid hotel id is required');
    }

    const res = await apiInstance.get<{ data: TimeSlot[] }>(
      `${BASE}/${id}/availability`,
      { params },
    );

    return res.data;
  },

  getOfficeInfo: async (): Promise<{ data: OfficeInfo }> => {
    const res = await apiInstance.get<{ data: OfficeInfo }>(`${BASE}/office/info`);
    return res.data;
  },

  getReviews: async (hotelId: number | string): Promise<{ data: { reviews: HotelReview[] } }> => {
    const id = String(hotelId);
    const res = await apiInstance.get<{ data: { reviews: HotelReview[] } }>(`${BASE}/${id}/reviews`);
    return res.data;
  },
};

import apiInstance from './api.instance';
import type {
  Hotel,
  HotelsParams,
  HotelsResponse,
  Room,
  RoomsParams,
  TimeSlot,
  AvailabilityParams,
} from '../types/hotels.types';

export type {
  Hotel,
  HotelsParams,
  HotelsResponse,
  Room,
  RoomsParams,
  TimeSlot,
  AvailabilityParams,
};

export type { BookingType } from '../types/hotels.types';

const BASE = '/api/v1/customer/hotels';

export const hotelsApi = {
  getAll: async (params?: HotelsParams): Promise<HotelsResponse> => {
    const res = await apiInstance.get<HotelsResponse>(BASE, { params });
    return res.data;
  },

  getById: async (id: number): Promise<{ data: Hotel }> => {
    if (!Number.isFinite(id)) {
      throw new Error('Valid hotel id is required');
    }

    const res = await apiInstance.get<{ data: Hotel }>(`${BASE}/${id}`);
    return res.data;
  },

  getRooms: async (
    hotelId: number,
    params?: RoomsParams,
  ): Promise<{ data: Room[] }> => {
    if (!Number.isFinite(hotelId)) {
      throw new Error('Valid hotel id is required');
    }

    const res = await apiInstance.get<{ data: Room[] }>(
      `${BASE}/${hotelId}/rooms`,
      { params },
    );

    return res.data;
  },

  getAvailability: async (
    hotelId: number,
    params: AvailabilityParams,
  ): Promise<{ data: TimeSlot[] }> => {
    if (!Number.isFinite(hotelId)) {
      throw new Error('Valid hotel id is required');
    }

    const res = await apiInstance.get<{ data: TimeSlot[] }>(
      `${BASE}/${hotelId}/availability`,
      { params },
    );

    return res.data;
  },

  getOfficeInfo: async () => {
    const res = await apiInstance.get(`${BASE}/office/info`);
    return res.data;
  },
};
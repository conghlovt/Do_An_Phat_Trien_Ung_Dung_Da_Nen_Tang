import apiInstance from '../../../shared/api/api.instance';
import type {
  Hotel,
  HotelsParams,
  HotelsResponse,
  Room,
  RoomsParams,
  TimeSlot,
  AvailabilityParams,
  OfficeInfo,
} from '../types/hotels.types';

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

export type { BookingType } from '../types/hotels.types';

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

  getOfficeInfo: async (): Promise<{ data: OfficeInfo }> => {
    const res = await apiInstance.get<{ data: OfficeInfo }>(`${BASE}/office/info`);
    return res.data;
  },
};

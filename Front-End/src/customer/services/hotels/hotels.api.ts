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
} from '@/src/customer/types/hotels';

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

export type { BookingType } from '@/src/customer/types/hotels';

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

  getViewed: async (): Promise<{ data: Hotel[] }> => {
    const res = await apiInstance.get<{ data: Hotel[] }>(`${BASE}/viewed`);
    return { data: res.data.data };
  },

  addViewed: async (id: number | string): Promise<void> => {
    const hotelId = String(id);

    if (!hotelId || hotelId === 'NaN') {
      throw new Error('Valid hotel id is required');
    }

    await apiInstance.post(`${BASE}/${hotelId}/view`);
  },

  getOfficeInfo: async (): Promise<{ data: OfficeInfo }> => {
    const res = await apiInstance.get<{ data: OfficeInfo }>(`${BASE}/office/info`);
    return res.data;
  },
};

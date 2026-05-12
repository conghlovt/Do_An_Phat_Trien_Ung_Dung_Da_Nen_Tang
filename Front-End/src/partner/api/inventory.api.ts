import apiInstance from '../core/api/api.instance';
import type { ApiResponse } from '../core/types/api.types';

export interface InventoryItem {
  totalRooms: number;
  bookedRooms: number;
  availableRooms: number;
  isClosed: boolean;
}

export interface CalendarRoomType {
  id: string;
  name: string;
  totalUnits: number;
  status: string;
  inventory: Record<string, InventoryItem>;
  pricing: Record<string, number>;
}

const base = (hotelId: string) => `/partner/hotels/${hotelId}/inventory`;

export const inventoryApi = {
  getCalendar: async (hotelId: string, startDate: string, endDate: string): Promise<CalendarRoomType[]> => {
    const res = await apiInstance.get<ApiResponse<CalendarRoomType[]>>(base(hotelId), {
      params: { startDate, endDate },
    });
    return res.data.data;
  },

  updateInventory: async (
    hotelId: string,
    roomTypeId: string,
    date: string,
    data: { totalRooms?: number; isClosed?: boolean }
  ) => {
    const res = await apiInstance.put<ApiResponse<any>>(`${base(hotelId)}/${roomTypeId}`, {
      date,
      ...data,
    });
    return res.data.data;
  },
};

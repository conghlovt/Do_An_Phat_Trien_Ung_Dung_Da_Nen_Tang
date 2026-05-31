import { create } from 'zustand';
import { hotelsApi } from '@/src/customer/services/hotels/hotels.api';
import type { Hotel, HotelsParams, Room, RoomsParams } from '@/src/customer/types/hotels';

interface CustomerHotelsState {
  hotels: Hotel[];
  hotelsLoading: boolean;
  hotelsError: string | null;
  currentHotel: Hotel | null;
  hotelDetailLoading: boolean;
  hotelDetailError: string | null;
  rooms: Room[];
  roomsLoading: boolean;
  roomsError: string | null;
  fetchHotels: (params?: HotelsParams) => Promise<void>;
  fetchHotel: (id: string | number) => Promise<void>;
  fetchViewedHotels: () => Promise<void>;
  fetchRooms: (hotelId: number | string, params?: RoomsParams, options?: { silent?: boolean }) => Promise<void>;
  setHotels: (hotels: Hotel[]) => void;
  clearHotels: () => void;
  clearCurrentHotel: () => void;
  clearRooms: () => void;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export const useCustomerHotelsStore = create<CustomerHotelsState>((set) => ({
  hotels: [],
  hotelsLoading: false,
  hotelsError: null,
  currentHotel: null,
  hotelDetailLoading: false,
  hotelDetailError: null,
  rooms: [],
  roomsLoading: false,
  roomsError: null,

  fetchHotels: async (params) => {
    try {
      set({ hotelsLoading: true, hotelsError: null });
      const { data } = await hotelsApi.getAll(params);
      set({ hotels: data });
    } catch (error) {
      set({ hotelsError: getErrorMessage(error, 'Không thể tải danh sách khách sạn'), hotels: [] });
    } finally {
      set({ hotelsLoading: false });
    }
  },

  fetchViewedHotels: async () => {
    try {
      set({ hotelsLoading: true, hotelsError: null });
      const { data } = await hotelsApi.getViewed();
      set({ hotels: data });
    } catch (error) {
      set({ hotelsError: getErrorMessage(error, 'Không thể tải khách sạn đã xem'), hotels: [] });
    } finally {
      set({ hotelsLoading: false });
    }
  },

  fetchHotel: async (id) => {
    try {
      set({ hotelDetailLoading: true, hotelDetailError: null });
      const { data } = await hotelsApi.getById(id);
      set({ currentHotel: data });
    } catch (error) {
      set({
        currentHotel: null,
        hotelDetailError: getErrorMessage(error, 'Không thể tải chi tiết khách sạn'),
      });
    } finally {
      set({ hotelDetailLoading: false });
    }
  },

  fetchRooms: async (hotelId, params, options) => {
    try {
      if (!options?.silent) set({ roomsLoading: true, roomsError: null });
      const { data } = await hotelsApi.getRooms(hotelId, params);
      set({ rooms: data });
    } catch (error) {
      set({ roomsError: getErrorMessage(error, 'Không thể tải danh sách phòng'), rooms: [] });
    } finally {
      if (!options?.silent) set({ roomsLoading: false });
    }
  },

  setHotels: (hotels) => set({ hotels }),
  clearHotels: () => set({ hotels: [], hotelsError: null, hotelsLoading: false }),
  clearCurrentHotel: () => set({ currentHotel: null, hotelDetailError: null, hotelDetailLoading: false }),
  clearRooms: () => set({ rooms: [], roomsError: null, roomsLoading: false }),
}));

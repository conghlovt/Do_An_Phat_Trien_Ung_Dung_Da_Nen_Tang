import { create } from 'zustand';
import { hotelsApi } from '@/src/customer/api/hotels.api';
import type { Hotel, HotelsParams, Room, RoomsParams } from '@/src/customer/types/hotels.types';
import type { ViewedHotel } from '@/src/customer/utils/viewedHotels';
import { toHotelFromViewed } from '@/src/customer/utils/viewedHotelMapper';

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
  fetchHotel: (id: string | number, fallback?: Hotel) => Promise<void>;
  fetchViewedHotels: (viewedHotels: ViewedHotel[]) => Promise<void>;
  fetchRooms: (hotelId: number | string, params?: RoomsParams) => Promise<void>;
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

  fetchViewedHotels: async (viewedHotels) => {
    try {
      set({ hotelsLoading: true, hotelsError: null });
      const hotelDetails = await Promise.all(
        viewedHotels.map(async (hotel) => {
          try {
            const { data } = await hotelsApi.getById(hotel.id);
            return data;
          } catch {
            return toHotelFromViewed(hotel);
          }
        }),
      );
      set({ hotels: hotelDetails });
    } catch (error) {
      set({ hotelsError: getErrorMessage(error, 'Không thể tải khách sạn đã xem'), hotels: [] });
    } finally {
      set({ hotelsLoading: false });
    }
  },

  fetchHotel: async (id, fallback) => {
    try {
      set({ hotelDetailLoading: true, hotelDetailError: null });
      const { data } = await hotelsApi.getById(id);
      set({ currentHotel: data });
    } catch (error) {
      set({
        currentHotel: fallback ?? null,
        hotelDetailError: getErrorMessage(error, 'Không thể tải chi tiết khách sạn'),
      });
    } finally {
      set({ hotelDetailLoading: false });
    }
  },

  fetchRooms: async (hotelId, params) => {
    try {
      set({ roomsLoading: true, roomsError: null });
      const { data } = await hotelsApi.getRooms(hotelId, params);
      set({ rooms: data });
    } catch (error) {
      set({ roomsError: getErrorMessage(error, 'Không thể tải danh sách phòng'), rooms: [] });
    } finally {
      set({ roomsLoading: false });
    }
  },

  setHotels: (hotels) => set({ hotels }),
  clearHotels: () => set({ hotels: [], hotelsError: null, hotelsLoading: false }),
  clearCurrentHotel: () => set({ currentHotel: null, hotelDetailError: null, hotelDetailLoading: false }),
  clearRooms: () => set({ rooms: [], roomsError: null, roomsLoading: false }),
}));

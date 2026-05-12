import { create } from 'zustand';
import type { Hotel, HotelListItem, HotelQueryParams } from '../types/hotel.types';
import type { RoomType } from '../types/room.types';
import type { PaginationMeta } from '../core/types/api.types';
import { hotelApi } from '../api/hotel.api';

interface PartnerState {
  // Hotel State
  hotels: HotelListItem[];
  currentHotel: Hotel | null;
  hotelPagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;

  // Room State
  roomTypes: RoomType[];
  currentRoomType: RoomType | null;

  // Actions
  fetchHotels: (params?: HotelQueryParams) => Promise<void>;
  fetchHotel: (id: string) => Promise<void>;
  setCurrentHotel: (hotel: Hotel | null) => void;
  setRoomTypes: (rooms: RoomType[]) => void;
  setCurrentRoomType: (room: RoomType | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const usePartnerStore = create<PartnerState>((set) => ({
  hotels: [],
  currentHotel: null,
  hotelPagination: null,
  isLoading: false,
  error: null,
  roomTypes: [],
  currentRoomType: null,

  fetchHotels: async (params?: HotelQueryParams) => {
    try {
      set({ isLoading: true, error: null });
      const response = await hotelApi.list(params);
      set({
        hotels: response.data.items,
        hotelPagination: response.meta?.pagination || null,
      });
    } catch (err: any) {
      set({ error: err.message || 'Không thể tải danh sách khách sạn' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchHotel: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const hotel = await hotelApi.getById(id);
      set({ currentHotel: hotel });
    } catch (err: any) {
      set({ error: err.message || 'Không thể tải thông tin khách sạn' });
    } finally {
      set({ isLoading: false });
    }
  },

  setCurrentHotel: (hotel) => set({ currentHotel: hotel }),
  setRoomTypes: (rooms) => set({ roomTypes: rooms }),
  setCurrentRoomType: (room) => set({ currentRoomType: room }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      hotels: [],
      currentHotel: null,
      hotelPagination: null,
      roomTypes: [],
      currentRoomType: null,
      isLoading: false,
      error: null,
    }),
}));

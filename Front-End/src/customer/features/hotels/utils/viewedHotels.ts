import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { Hotel } from '../types/hotels.types';

const STORAGE_KEY = 'customer:viewed-hotels';
const MAX_VIEWED_HOTELS = 12;

export type ViewedHotel = Partial<Hotel> & Pick<Hotel, 'id' | 'name' | 'image'>;

async function getStoredValue() {
  if (Platform.OS === 'web') {
    return localStorage.getItem(STORAGE_KEY);
  }

  return SecureStore.getItemAsync(STORAGE_KEY);
}

async function setStoredValue(value: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(STORAGE_KEY, value);
    return;
  }

  await SecureStore.setItemAsync(STORAGE_KEY, value);
}

export const viewedHotelsStorage = {
  getAll: async (): Promise<ViewedHotel[]> => {
    try {
      const raw = await getStoredValue();
      if (!raw) return [];

      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  add: async (hotel: Hotel): Promise<void> => {
    try {
      const current = await viewedHotelsStorage.getAll();
      const nextHotel: ViewedHotel = {
        id: hotel.id,
        name: hotel.name,
        image: hotel.image,
        images: hotel.images,
        rating: hotel.rating,
        reviews: hotel.reviews,
        location: hotel.location,
        district: hotel.district,
        discount: hotel.discount,
        price: hotel.price,
        priceValue: hotel.priceValue,
        unit: hotel.unit,
        oldPrice: hotel.oldPrice,
        badge: hotel.badge,
        tags: hotel.tags,
      };
      const next = [
        nextHotel,
        ...current.filter((item) => String(item.id) !== String(hotel.id)),
      ].slice(0, MAX_VIEWED_HOTELS);

      await setStoredValue(JSON.stringify(next));
    } catch {
      // Viewed history is optional UI data.
    }
  },
};

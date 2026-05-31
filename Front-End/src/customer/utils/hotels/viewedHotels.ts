import { hotelsApi } from '@/src/customer/services/hotels/hotels.api';
import type { Hotel } from '@/src/customer/types/hotels';

export const viewedHotelsApi = {
  getAll: async (): Promise<Hotel[]> => {
    const { data } = await hotelsApi.getViewed();
    return data;
  },

  add: async (hotel: Hotel): Promise<void> => {
    await hotelsApi.addViewed(hotel.id);
  },
};

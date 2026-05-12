import apiInstance from '../core/api/api.instance';
import type { ApiResponse } from '../core/types/api.types';
import type { Amenity } from '../types/hotel.types';

/**
 * Fetch all active amenities from public API
 */
export const amenityApi = {
  listAll: async (): Promise<Amenity[]> => {
    const res = await apiInstance.get<ApiResponse<Amenity[]>>('/amenities');
    return res.data.data;
  },
};

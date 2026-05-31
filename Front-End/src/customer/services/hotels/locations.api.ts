import apiInstance from '@/src/customer/core/api/api.instance';

export interface LocationWard {
  name: string;
  count: number;
}

export interface LocationDistrict {
  name: string;
  count: number;
  wards: LocationWard[];
}

export interface LocationProvince {
  name: string;
  count: number;
  districts: LocationDistrict[];
}

export const locationsApi = {
  getCustomerLocations: async (): Promise<LocationProvince[]> => {
    const res = await apiInstance.get<{ data: LocationProvince[] }>('/api/customer/locations');
    return res.data.data;
  },

  getHotelLocations: async (): Promise<LocationProvince[]> => {
    const res = await apiInstance.get<{ data: LocationProvince[] }>('/api/customer/hotels/locations');
    return res.data.data;
  },
};

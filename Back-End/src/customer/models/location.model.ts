import type { LocationProvince } from './hotel.model';

export interface VietnamWardApiItem {
  code: number;
  name: string;
}

export interface VietnamDistrictApiItem {
  code: number;
  name: string;
  wards?: VietnamWardApiItem[];
}

export interface VietnamProvinceApiItem {
  code: number;
  name: string;
  districts?: VietnamDistrictApiItem[];
}

export type CustomerLocationProvince = LocationProvince;

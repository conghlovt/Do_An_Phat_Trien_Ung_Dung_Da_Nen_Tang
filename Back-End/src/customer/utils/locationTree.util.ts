import type { LocationProvince } from '../models/hotel.model';
import { compareVietnamese, normalizeName } from './text.util';

export type LocationRow = {
  province: string;
  district: string;
  ward?: string | undefined;
};

export const buildLocationTree = (rows: LocationRow[]): LocationProvince[] => {
  const provinceMap = new Map<string, {
    count: number;
    districts: Map<string, { count: number; wards: Map<string, number> }>;
  }>();

  rows.forEach((row) => {
    const provinceName = normalizeName(row.province);
    const districtName = normalizeName(row.district);
    const wardName = normalizeName(row.ward);

    if (!provinceName || !districtName) return;

    if (!provinceMap.has(provinceName)) {
      provinceMap.set(provinceName, { count: 0, districts: new Map() });
    }

    const province = provinceMap.get(provinceName);
    if (!province) return;
    province.count += 1;

    if (!province.districts.has(districtName)) {
      province.districts.set(districtName, { count: 0, wards: new Map() });
    }

    const district = province.districts.get(districtName);
    if (!district) return;
    district.count += 1;

    if (wardName) {
      district.wards.set(wardName, (district.wards.get(wardName) ?? 0) + 1);
    }
  });

  return Array.from(provinceMap.entries())
    .map(([name, province]) => ({
      name,
      count: province.count,
      districts: Array.from(province.districts.entries())
        .map(([districtName, district]) => ({
          name: districtName,
          count: district.count,
          wards: Array.from(district.wards.entries())
            .map(([wardName, count]) => ({ name: wardName, count }))
            .sort((a, b) => compareVietnamese(a.name, b.name)),
        }))
        .sort((a, b) => compareVietnamese(a.name, b.name)),
    }))
    .filter((province) => province.count > 0)
    .sort((a, b) => compareVietnamese(a.name, b.name));
};

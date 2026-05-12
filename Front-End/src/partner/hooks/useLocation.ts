import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// ============================================================
// useLocation — Hook lấy dữ liệu Tỉnh / Quận / Phường
// API: https://provinces.open-api.vn
// ============================================================

const PROVINCES_API = 'https://provinces.open-api.vn/api';

export interface LocationItem {
  code: number;
  name: string;
}

interface UseLocationReturn {
  provinces: LocationItem[];
  districts: LocationItem[];
  wards: LocationItem[];
  loadingProvinces: boolean;
  loadingDistricts: boolean;
  loadingWards: boolean;
  fetchDistricts: (provinceCode: number) => Promise<void>;
  fetchWards: (districtCode: number) => Promise<void>;
  resetDistricts: () => void;
  resetWards: () => void;
}

export const useLocation = (): UseLocationReturn => {
  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [wards, setWards] = useState<LocationItem[]>([]);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Lấy danh sách Tỉnh/Thành khi mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoadingProvinces(true);
        const res = await axios.get(`${PROVINCES_API}/?depth=1`);
        const items: LocationItem[] = res.data.map((p: any) => ({
          code: p.code,
          name: p.name,
        }));
        setProvinces(items);
      } catch (err) {
        console.error('[useLocation] Lỗi tải danh sách tỉnh/thành:', err);
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  // Lấy danh sách Quận/Huyện theo mã Tỉnh
  const fetchDistricts = useCallback(async (provinceCode: number) => {
    try {
      setLoadingDistricts(true);
      setDistricts([]);
      setWards([]);
      const res = await axios.get(`${PROVINCES_API}/p/${provinceCode}?depth=2`);
      const items: LocationItem[] = (res.data.districts || []).map((d: any) => ({
        code: d.code,
        name: d.name,
      }));
      setDistricts(items);
    } catch (err) {
      console.error('[useLocation] Lỗi tải danh sách quận/huyện:', err);
    } finally {
      setLoadingDistricts(false);
    }
  }, []);

  // Lấy danh sách Phường/Xã theo mã Huyện
  const fetchWards = useCallback(async (districtCode: number) => {
    try {
      setLoadingWards(true);
      setWards([]);
      const res = await axios.get(`${PROVINCES_API}/d/${districtCode}?depth=2`);
      const items: LocationItem[] = (res.data.wards || []).map((w: any) => ({
        code: w.code,
        name: w.name,
      }));
      setWards(items);
    } catch (err) {
      console.error('[useLocation] Lỗi tải danh sách phường/xã:', err);
    } finally {
      setLoadingWards(false);
    }
  }, []);

  const resetDistricts = useCallback(() => {
    setDistricts([]);
    setWards([]);
  }, []);

  const resetWards = useCallback(() => {
    setWards([]);
  }, []);

  return {
    provinces,
    districts,
    wards,
    loadingProvinces,
    loadingDistricts,
    loadingWards,
    fetchDistricts,
    fetchWards,
    resetDistricts,
    resetWards,
  };
};

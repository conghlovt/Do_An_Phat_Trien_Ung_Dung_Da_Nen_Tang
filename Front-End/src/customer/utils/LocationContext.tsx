import React, { createContext, useContext, useState, useCallback } from 'react';
import * as Location from 'expo-location';

export interface Province {
  id: string;
  name: string;
  code: string;
  region: string;
  numberOfHotels?: number;
}

interface LocationContextValue {
  selectedProvince: Province;
  setSelectedProvince: (province: Province) => void;
  provinces: Province[];
  isLoading: boolean;
  detectLocation: () => Promise<void>;
}

export const PROVINCES: Province[] = [
  // North
  { id: '01', name: 'Hà Nội', code: 'HN', region: 'Bắc', numberOfHotels: 810 },
  { id: '02', name: 'Hà Giang', code: 'HG', region: 'Bắc', numberOfHotels: 15 },
  { id: '04', name: 'Cao Bằng', code: 'CB', region: 'Bắc', numberOfHotels: 12 },
  { id: '06', name: 'Bắc Kạn', code: 'BK', region: 'Bắc', numberOfHotels: 8 },
  { id: '08', name: 'Tuyên Quang', code: 'TQ', region: 'Bắc', numberOfHotels: 6 },
  { id: '10', name: 'Lào Cai', code: 'LC', region: 'Bắc', numberOfHotels: 45 },
  { id: '11', name: 'Điện Biên', code: 'ĐB', region: 'Bắc', numberOfHotels: 5 },
  { id: '12', name: 'Lai Châu', code: 'LC', region: 'Bắc', numberOfHotels: 4 },
  { id: '14', name: 'Sơn La', code: 'SL', region: 'Bắc', numberOfHotels: 7 },
  { id: '15', name: 'Yên Bái', code: 'YB', region: 'Bắc', numberOfHotels: 8 },
  { id: '17', name: 'Hoà Bình', code: 'HB', region: 'Bắc', numberOfHotels: 22 },
  { id: '19', name: 'Thái Nguyên', code: 'TN', region: 'Bắc', numberOfHotels: 18 },
  { id: '20', name: 'Phú Thọ', code: 'PT', region: 'Bắc', numberOfHotels: 14 },
  { id: '22', name: 'Vĩnh Phúc', code: 'VP', region: 'Bắc', numberOfHotels: 16 },
  { id: '24', name: 'Bắc Giang', code: 'BG', region: 'Bắc', numberOfHotels: 12 },
  { id: '25', name: 'Bắc Ninh', code: 'BN', region: 'Bắc', numberOfHotels: 19 },
  { id: '26', name: 'Hải Dương', code: 'HD', region: 'Bắc', numberOfHotels: 24 },
  { id: '27', name: 'Hải Phòng', code: 'HP', region: 'Bắc', numberOfHotels: 156 },
  { id: '30', name: 'Hưng Yên', code: 'HY', region: 'Bắc', numberOfHotels: 9 },
  { id: '31', name: 'Thái Bình', code: 'TB', region: 'Bắc', numberOfHotels: 11 },
  { id: '33', name: 'Nam Định', code: 'ND', region: 'Bắc', numberOfHotels: 8 },
  { id: '35', name: 'Ninh Bình', code: 'NB', region: 'Bắc', numberOfHotels: 78 },
  // North Central
  { id: '36', name: 'Thanh Hóa', code: 'TH', region: 'Bắc Trung Bộ', numberOfHotels: 42 },
  { id: '37', name: 'Nghệ An', code: 'NA', region: 'Bắc Trung Bộ', numberOfHotels: 38 },
  { id: '38', name: 'Hà Tĩnh', code: 'HTĩ', region: 'Bắc Trung Bộ', numberOfHotels: 18 },
  // Central
  { id: '40', name: 'Quảng Bình', code: 'QB', region: 'Trung Bộ', numberOfHotels: 52 },
  { id: '42', name: 'Quảng Trị', code: 'QTr', region: 'Trung Bộ', numberOfHotels: 25 },
  { id: '44', name: 'Thừa Thiên Huế', code: 'TTH', region: 'Trung Bộ', numberOfHotels: 187 },
  { id: '45', name: 'Đà Nẵng', code: 'ĐN', region: 'Trung Bộ', numberOfHotels: 268 },
  { id: '46', name: 'Quảng Nam', code: 'QN', region: 'Trung Bộ', numberOfHotels: 124 },
  { id: '49', name: 'Quảng Ngãi', code: 'QNg', region: 'Trung Bộ', numberOfHotels: 31 },
  { id: '51', name: 'Bình Định', code: 'BĐ', region: 'Trung Bộ', numberOfHotels: 56 },
  { id: '52', name: 'Phú Yên', code: 'PY', region: 'Trung Bộ', numberOfHotels: 67 },
  { id: '56', name: 'Khánh Hòa', code: 'KH', region: 'Trung Bộ', numberOfHotels: 205 },
  { id: '58', name: 'Ninh Thuận', code: 'NT', region: 'Trung Bộ', numberOfHotels: 43 },
  { id: '60', name: 'Bình Thuận', code: 'BT', region: 'Trung Bộ', numberOfHotels: 89 },
  // South Central Highlands
  { id: '62', name: 'Gia Lai', code: 'GL', region: 'Tây Nguyên', numberOfHotels: 205 },
  { id: '64', name: 'Đắk Lắk', code: 'ĐL', region: 'Tây Nguyên', numberOfHotels: 87 },
  { id: '66', name: 'Đắk Nông', code: 'ĐN', region: 'Tây Nguyên', numberOfHotels: 34 },
  { id: '67', name: 'Lâm Đồng', code: 'LĐ', region: 'Tây Nguyên', numberOfHotels: 205 },
  // South
  { id: '70', name: 'Bình Phước', code: 'BP', region: 'Nam', numberOfHotels: 23 },
  { id: '72', name: 'Tây Ninh', code: 'TN', region: 'Nam', numberOfHotels: 15 },
  { id: '74', name: 'Bình Dương', code: 'BDương', region: 'Nam', numberOfHotels: 67 },
  { id: '75', name: 'Đồng Nai', code: 'ĐNai', region: 'Nam', numberOfHotels: 112 },
  { id: '77', name: 'Bà Rịa - Vũng Tàu', code: 'BRV', region: 'Nam', numberOfHotels: 268 },
  { id: '79', name: 'Hồ Chí Minh', code: 'TPHCM', region: 'Nam', numberOfHotels: 1250 },
  { id: '80', name: 'Long An', code: 'LA', region: 'Nam', numberOfHotels: 108 },
  { id: '82', name: 'Tiền Giang', code: 'TG', region: 'Nam', numberOfHotels: 45 },
  { id: '83', name: 'Bến Tre', code: 'BT', region: 'Nam', numberOfHotels: 24 },
  { id: '84', name: 'Trà Vinh', code: 'TV', region: 'Nam', numberOfHotels: 46 },
  { id: '86', name: 'Vĩnh Long', code: 'VL', region: 'Nam', numberOfHotels: 35 },
  { id: '87', name: 'Đồng Tháp', code: 'ĐT', region: 'Nam', numberOfHotels: 28 },
  { id: '89', name: 'An Giang', code: 'AG', region: 'Nam', numberOfHotels: 80 },
  { id: '91', name: 'Kiên Giang', code: 'KG', region: 'Nam', numberOfHotels: 1970 },
  { id: '92', name: 'Cần Thơ', code: 'CT', region: 'Nam', numberOfHotels: 549 },
  { id: '93', name: 'Hậu Giang', code: 'HG', region: 'Nam', numberOfHotels: 22 },
  { id: '94', name: 'Sóc Trăng', code: 'ST', region: 'Nam', numberOfHotels: 38 },
  { id: '95', name: 'Bạc Liêu', code: 'BL', region: 'Nam', numberOfHotels: 549 },
  { id: '96', name: 'Cà Mau', code: 'CM', region: 'Nam', numberOfHotels: 205 },
  // Special
  { id: '97', name: 'Phú Quốc', code: 'PQ', region: 'Nam', numberOfHotels: 156 },
];

function matchProvince(rawName: string): Province | null {
  if (!rawName) return null;
  const normalized = rawName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const aliases: Record<string, string> = {
    'ho chi minh': '79',
    'thanh pho ho chi minh': '79',
    'tp ho chi minh': '79',
    'tp hcm': '79',
    hcm: '79',
    'ha noi': '01',
    hanoi: '01',
    'da nang': '45',
    'can tho': '92',
    'hai phong': '27',
    'phu quoc': '97',
  };

  for (const [alias, id] of Object.entries(aliases)) {
    if (normalized.includes(alias)) {
      return PROVINCES.find((p) => p.id === id) ?? null;
    }
  }

  return (
    PROVINCES.find((p) => {
      const pNorm = p.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      return normalized.includes(pNorm) || pNorm.includes(normalized);
    }) ?? null
  );
}

const LocationContext = createContext<LocationContextValue>({
  selectedProvince: PROVINCES[0],
  setSelectedProvince: () => {},
  provinces: PROVINCES,
  isLoading: false,
  detectLocation: async () => {},
});

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [selectedProvince, setSelectedProvince] = useState<Province>(PROVINCES[0]);
  const [isLoading, setIsLoading] = useState(false);

  const detectLocation = useCallback(async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission denied');
        return;
      }

      const coords = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const [address] = await Location.reverseGeocodeAsync({
        latitude: coords.coords.latitude,
        longitude: coords.coords.longitude,
      });

      if (!address) return;

      const candidates = [address.region, address.city, address.subregion].filter(
        Boolean,
      ) as string[];

      for (const candidate of candidates) {
        const matched = matchProvince(candidate);
        if (matched) {
          setSelectedProvince(matched);
          return;
        }
      }

      console.warn('Could not match province from:', candidates);
    } catch (err) {
      console.error('detectLocation error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <LocationContext.Provider
      value={{
        selectedProvince,
        setSelectedProvince,
        provinces: PROVINCES,
        isLoading,
        detectLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export const useLocationContext = () => useContext(LocationContext);

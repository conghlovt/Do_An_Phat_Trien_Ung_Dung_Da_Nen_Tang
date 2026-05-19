import type { Hotel, HotelsParams } from '../types/hotels.types';

export type SortOption = NonNullable<HotelsParams['sort']>;

export const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'relevant', label: 'Phù hợp nhất' },
  { id: 'rating', label: 'Điểm đánh giá từ cao đến thấp' },
  { id: 'price-asc', label: 'Giá từ thấp đến cao' },
  { id: 'price-desc', label: 'Giá từ cao đến thấp' },
];

export const HOTEL_FILTER_TYPES = [
  'Tất cả',
  'Flash Sale',
  'Giảm giá',
  'Ưu đãi',
  'Nổi bật',
  'Mới',
  'Gọi điện đặt phòng',
];

export const HOTEL_AMENITY_FILTERS = [
  'Wi-Fi miễn phí',
  'Ghế tình yêu',
  'Lễ tân 24/24',
  'Thang máy',
  'Dịch vụ dọn phòng',
  'Tiện nghi là/ủi',
  'Dịch vụ lưu trữ/bảo quản hành lý',
  'Bồn tắm',
  'Smart TV',
  'Điều hoà',
  'Khu vực có thể hút thuốc',
  'Đưa đón sân bay',
  'Bãi đỗ xe ô tô',
  'Quán cafe',
  'Nhà hàng',
  'Đồ dùng làm bếp',
  'Máy sấy tóc',
  'Két sắt',
  'Bể bơi',
  'Tủ lạnh',
];

export interface HotelListFilterState {
  maxPrice?: number;
  minPrice?: number;
  selectedAmenities?: string[];
  selectedHotelTypes: string[];
  sort: SortOption;
}

const HOTEL_TYPE_ALIASES: Record<string, string[]> = {
  'Giảm giá': ['Giảm', 'Sale', 'Discount'],
  'Ưu đãi': ['Ưu đãi', 'Khuyến mãi', 'Deal'],
  'Gọi điện đặt phòng': ['Gọi điện', 'Điện thoại', 'Call'],
};

const normalize = (value: string | undefined) =>
  (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const compact = (value: string | undefined) => normalize(value).replace(/\s/g, '');

const textMatches = (source: string | undefined, keyword: string | undefined) => {
  const normalizedSource = normalize(source);
  const normalizedKeyword = normalize(keyword);
  const compactSource = compact(source);
  const compactKeyword = compact(keyword);

  if (!normalizedSource || !normalizedKeyword) return false;

  return normalizedSource.includes(normalizedKeyword) ||
    normalizedKeyword.includes(normalizedSource) ||
    compactSource.includes(compactKeyword) ||
    compactKeyword.includes(compactSource);
};

const matchesHotelTypes = (hotel: Hotel, selectedHotelTypes: string[]) => {
  if (selectedHotelTypes.length === 0) return true;

  const searchable = [
    ...hotel.tags,
    hotel.badge,
    hotel.discount,
  ];

  return selectedHotelTypes.some((type) => {
    const keywords = [type, ...(HOTEL_TYPE_ALIASES[type] ?? [])];
    return keywords.some((keyword) => searchable.some((value) => textMatches(value, keyword)));
  });
};

const matchesAmenities = (hotel: Hotel, selectedAmenities: string[] = []) => {
  if (selectedAmenities.length === 0) return true;
  const amenities = hotel.amenities ?? [];

  return selectedAmenities.every((amenity) =>
    amenities.some((value) => textMatches(value, amenity)),
  );
};

export function applyHotelListFilters(hotels: Hotel[], filters: HotelListFilterState) {
  const filtered = hotels.filter((hotel) => {
    const aboveMin = filters.minPrice === undefined || hotel.priceValue >= filters.minPrice;
    const belowMax = filters.maxPrice === undefined || hotel.priceValue <= filters.maxPrice;
    return aboveMin &&
      belowMax &&
      matchesHotelTypes(hotel, filters.selectedHotelTypes) &&
      matchesAmenities(hotel, filters.selectedAmenities);
  });

  if (filters.sort === 'rating') {
    return [...filtered].sort((a, b) => b.rating - a.rating);
  }

  if (filters.sort === 'price-asc') {
    return [...filtered].sort((a, b) => a.priceValue - b.priceValue);
  }

  if (filters.sort === 'price-desc') {
    return [...filtered].sort((a, b) => b.priceValue - a.priceValue);
  }

  return filtered;
}

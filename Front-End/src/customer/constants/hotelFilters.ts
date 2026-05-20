import type { SortOption } from '@/src/customer/utils/hotelListFilters';

export type NearMeSortOption = SortOption | 'distance';

export const CUSTOMER_PRIMARY = '#85c2a4';
export const CUSTOMER_PRIMARY_DARK = '#599373';

export const DEFAULT_MIN_PRICE = '20000';
export const DEFAULT_MAX_PRICE = '10000000';
export const PRICE_MIN_LIMIT = Number(DEFAULT_MIN_PRICE);
export const PRICE_MAX_LIMIT = Number(DEFAULT_MAX_PRICE);
export const PRICE_KNOB_SIZE = 34;
export const PRICE_TRACK_ACTIVE = CUSTOMER_PRIMARY;
export const PRICE_TRACK_INACTIVE = '#414647';

export const NEAR_ME_SORT_OPTIONS: { id: NearMeSortOption; label: string }[] = [
  { id: 'relevant', label: 'Phù hợp nhất' },
  { id: 'distance', label: 'Khoảng cách từ gần đến xa' },
  { id: 'rating', label: 'Điểm đánh giá từ cao đến thấp' },
  { id: 'price-asc', label: 'Giá từ thấp đến cao' },
  { id: 'price-desc', label: 'Giá từ cao đến thấp' },
];

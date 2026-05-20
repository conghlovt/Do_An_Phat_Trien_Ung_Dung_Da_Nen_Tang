import type { BookingType } from '../types/hotels.types';

export const SECTION_COLORS: Record<string, string> = {
  'Flash Sale': '#eab308',
  'Ưu đãi đặc biệt': '#85c2a4',
  'StayHub gợi ý': '#8b5cf6',
  'Top được bình chọn': '#059669',
  'Khách sạn mới': '#3b82f6',
};

export const SECTION_TAG_MAP: Record<string, string> = {
  'Flash Sale': 'Flash Sale',
  'Ưu đãi đặc biệt': 'Ưu đãi',
  'StayHub gợi ý': 'Gợi ý',
  'Gợi ý cho bạn': 'Gợi ý',
  'Top được bình chọn': 'Nổi bật',
  'Khách sạn mới': 'Mới',
};

export const FLASH_SALE_TABS: BookingType[] = ['Theo giờ', 'Qua đêm'];
export const SECTION_PREVIEW_LIMIT = 4;

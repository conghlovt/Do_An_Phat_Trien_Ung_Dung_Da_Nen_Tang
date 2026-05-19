import type { BookingType } from '@/src/customer/features/hotels/types/hotels.types';

export type BookingTabType = 'hourly' | 'overnight' | 'daily';

export const BOOKING_TYPES: BookingType[] = ['Theo giờ', 'Qua đêm', 'Theo ngày'];

export const BOOKING_TYPE_TITLES: Record<BookingType, string> = {
  'Theo giờ': 'Khách sạn theo giờ',
  'Qua đêm': 'Khách sạn qua đêm',
  'Theo ngày': 'Khách sạn theo ngày',
};

export const BOOKING_TAB_TO_TYPE: Record<BookingTabType, BookingType> = {
  hourly: 'Theo giờ',
  overnight: 'Qua đêm',
  daily: 'Theo ngày',
};

export const BOOKING_TYPE_TO_TAB: Record<BookingType, BookingTabType> = {
  'Theo giờ': 'hourly',
  'Qua đêm': 'overnight',
  'Theo ngày': 'daily',
};

export const SEARCH_BOOKING_TABS: { id: BookingTabType; label: BookingType }[] = [
  { id: 'hourly', label: 'Theo giờ' },
  { id: 'overnight', label: 'Qua đêm' },
  { id: 'daily', label: 'Theo ngày' },
];

export function formatShortDate(date: Date) {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
}

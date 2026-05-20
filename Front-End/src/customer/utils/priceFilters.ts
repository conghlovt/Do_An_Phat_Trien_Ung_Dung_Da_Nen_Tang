import {
  PRICE_MAX_LIMIT,
  PRICE_MIN_LIMIT,
} from '@/src/customer/constants/hotelFilters';

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const normalizePrice = (value: number) =>
  Math.round(clamp(value, PRICE_MIN_LIMIT, PRICE_MAX_LIMIT));

export const getPriceNumber = (value: string, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? clamp(parsed, PRICE_MIN_LIMIT, PRICE_MAX_LIMIT) : fallback;
};

export const sanitizePriceInput = (value: string) => value.replace(/\D/g, '');

export const formatPriceInput = (value: string) => {
  const parsed = Number(sanitizePriceInput(value));
  return Number.isFinite(parsed) && parsed > 0 ? `${parsed.toLocaleString('vi-VN')}đ` : '';
};

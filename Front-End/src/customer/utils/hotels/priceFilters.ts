import {
  PRICE_MAX_LIMIT,
  PRICE_MIN_LIMIT,
} from '@/src/customer/constants/hotels/hotelFilters';

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const PRICE_STEP = 10000;

export const normalizePrice = (value: number) =>
  clamp(Math.round(value / PRICE_STEP) * PRICE_STEP, PRICE_MIN_LIMIT, PRICE_MAX_LIMIT);

export const getPriceNumber = (value: string, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? clamp(parsed, PRICE_MIN_LIMIT, PRICE_MAX_LIMIT) : fallback;
};

export const sanitizePriceInput = (value: string) => value.replace(/\D/g, '');

export const formatPriceInput = (value: string) => {
  const parsed = Number(sanitizePriceInput(value));
  return Number.isFinite(parsed) && parsed > 0 ? `${parsed.toLocaleString('vi-VN')}đ` : '';
};

export const getPriceFilterBounds = (minPrice: string, maxPrice: string) => {
  const parsedMin = Number(sanitizePriceInput(minPrice));
  const parsedMax = Number(sanitizePriceInput(maxPrice));
  const hasMin = Number.isFinite(parsedMin) && parsedMin > 0;
  const hasMax = Number.isFinite(parsedMax) && parsedMax > 0;

  if (hasMin && hasMax) {
    return {
      minPrice: Math.min(parsedMin, parsedMax),
      maxPrice: Math.max(parsedMin, parsedMax),
    };
  }

  return {
    minPrice: hasMin ? parsedMin : undefined,
    maxPrice: hasMax ? parsedMax : undefined,
  };
};

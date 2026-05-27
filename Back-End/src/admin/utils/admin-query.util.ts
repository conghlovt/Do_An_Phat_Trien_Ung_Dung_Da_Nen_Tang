import type { Request } from 'express';

export type SortOrder = 'asc' | 'desc';

export type Pagination = {
  page: number;
  limit: number;
  skip: number;
};

export type DateRange = {
  from?: Date | undefined;
  to?: Date | undefined;
};

const MAX_LIMIT = 500;

const firstString = (value: unknown) => {
  if (Array.isArray(value)) return String(value[0] || '').trim();
  return String(value || '').trim();
};

const startOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const endOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
};

export const getSearchQuery = (req: Request) =>
  firstString(req.query.search || req.query.q);

export const getStringQuery = (req: Request, key: string) =>
  firstString(req.query[key]);

export const parsePagination = (req: Request, defaultLimit = 10): Pagination => {
  const rawPage = Number(req.query.page || 1);
  const rawLimit = Number(req.query.limit || defaultLimit);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const limit = Number.isFinite(rawLimit) && rawLimit > 0
    ? Math.min(Math.floor(rawLimit), MAX_LIMIT)
    : defaultLimit;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

export const parseDateRangeFromQuery = (query: Request['query']): DateRange => {
  const fromValue = firstString(query.from);
  const toValue = firstString(query.to);
  const range: DateRange = {};

  if (fromValue) {
    const date = new Date(fromValue);
    if (!Number.isNaN(date.getTime())) range.from = startOfDay(date);
  }

  if (toValue) {
    const date = new Date(toValue);
    if (!Number.isNaN(date.getTime())) range.to = endOfDay(date);
  }

  return range;
};

export const buildCreatedAtWhere = (range: DateRange) => {
  if (!range.from && !range.to) return {};
  return {
    createdAt: {
      ...(range.from ? { gte: range.from } : {}),
      ...(range.to ? { lte: range.to } : {}),
    },
  };
};

export const normalizeSortOrder = (value: unknown): SortOrder =>
  firstString(value).toLowerCase() === 'asc' ? 'asc' : 'desc';

export const buildPagination = (page: number, limit: number, total: number) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

export const buildListResult = <T>(
  key: string,
  items: T[],
  page: number,
  limit: number,
  total: number,
) => ({
  [key]: items,
  items,
  total,
  page,
  limit,
  pagination: buildPagination(page, limit, total),
});

export const getExportFileDate = () => new Date().toISOString().slice(0, 10);

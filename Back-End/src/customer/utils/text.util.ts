export const compareVietnamese = (a: string, b: string) =>
  a.localeCompare(b, 'vi', { sensitivity: 'base' });

export const normalizeName = (value: string | null | undefined) =>
  value?.replace(/\s+/g, ' ').trim() ?? '';

export const normalizeSearch = (value: string | null | undefined) =>
  normalizeName(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');

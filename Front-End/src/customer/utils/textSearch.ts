export const normalizeSearchText = (value: string | undefined) =>
  (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const compactSearchText = (value: string | undefined) => normalizeSearchText(value).replace(/\s/g, '');

export const textMatches = (source: string | undefined, keyword: string | undefined) => {
  const normalizedSource = normalizeSearchText(source);
  const normalizedKeyword = normalizeSearchText(keyword);
  const compactSource = compactSearchText(source);
  const compactKeyword = compactSearchText(keyword);

  if (!normalizedSource || !normalizedKeyword) return false;

  return normalizedSource.includes(normalizedKeyword) ||
    normalizedKeyword.includes(normalizedSource) ||
    compactSource.includes(compactKeyword) ||
    compactKeyword.includes(compactSource);
};

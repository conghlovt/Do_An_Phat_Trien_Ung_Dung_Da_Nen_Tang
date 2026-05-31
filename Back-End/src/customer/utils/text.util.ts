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

const ADMINISTRATIVE_WORDS =
  /\b(thanh pho|tp|tinh|quan|huyen|thi xa|thi tran|phuong|xa)\b/g;

const LOCATION_ALIASES = [
  ['ho chi minh', 'hcm', 'tphcm', 'tp hcm', 'sai gon', 'saigon'],
  ['ha noi', 'hanoi'],
  ['da nang', 'danang'],
  ['can tho', 'cantho'],
  ['hai phong', 'haiphong'],
  ['ba ria vung tau', 'brvt', 'vung tau'],
  ['thua thien hue', 'hue'],
];

export const normalizeSearchText = (
  value: string | null | undefined,
  stripAdministrativeWords = false,
) => {
  const normalized = normalizeSearch(value);

  return (stripAdministrativeWords
    ? normalized.replace(ADMINISTRATIVE_WORDS, ' ')
    : normalized
  )
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
};

const compactSearchText = (
  value: string | null | undefined,
  stripAdministrativeWords = false,
) => normalizeSearchText(value, stripAdministrativeWords).replace(/\s/g, '');

const searchVariants = (
  value: string | null | undefined,
  stripAdministrativeWords = false,
) => {
  const normalized = normalizeSearchText(value, stripAdministrativeWords);
  const compact = compactSearchText(value, stripAdministrativeWords);
  const variants = new Set<string>();

  if (normalized) variants.add(normalized);
  if (compact) variants.add(compact);

  for (const group of LOCATION_ALIASES) {
    const normalizedGroup = group.map((alias) => normalizeSearchText(alias, stripAdministrativeWords));
    const compactGroup = normalizedGroup.map((alias) => alias.replace(/\s/g, ''));
    const matchesAlias =
      normalizedGroup.includes(normalized) || compactGroup.includes(compact);

    if (matchesAlias) {
      normalizedGroup.forEach((alias) => {
        variants.add(alias);
        variants.add(alias.replace(/\s/g, ''));
      });
    }
  }

  return [...variants];
};

export const textMatches = (
  source: string | null | undefined,
  keyword: string | null | undefined,
  options?: { stripAdministrativeWords?: boolean },
) => {
  const sourceVariants = searchVariants(source, options?.stripAdministrativeWords);
  const keywordVariants = searchVariants(keyword, options?.stripAdministrativeWords);

  if (sourceVariants.length === 0 || keywordVariants.length === 0) return false;

  return sourceVariants.some((sourceValue) =>
    keywordVariants.some((keywordValue) =>
      sourceValue.includes(keywordValue) || keywordValue.includes(sourceValue),
    ),
  );
};

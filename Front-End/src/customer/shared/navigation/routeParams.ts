export function getParamText(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
}

export function getParamNumber(value: unknown, fallback: number): number {
  const numeric = Number(getParamText(value));
  return Number.isFinite(numeric) ? numeric : fallback;
}

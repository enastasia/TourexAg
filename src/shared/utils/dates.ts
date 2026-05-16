const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24;

const normalizeDate = (value: Date | string): Date => {
  if (value instanceof Date) {
    return new Date(
      value.getFullYear(),
      value.getMonth(),
      value.getDate(),
      12,
      0,
      0,
      0,
    );
  }

  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
};

export const differenceInDays = (
  start: Date | string,
  end: Date | string,
): number => {
  const startDate = normalizeDate(start);
  const endDate = normalizeDate(end);

  return Math.round(
    (endDate.getTime() - startDate.getTime()) / MILLISECONDS_IN_DAY,
  );
};

export const isAtLeastDaysAfter = (
  start: Date | string,
  end: Date | string,
  minimumDays: number,
): boolean => differenceInDays(start, end) >= minimumDays;

export const addDays = (value: Date | string, amount: number): Date => {
  const normalized = normalizeDate(value);
  normalized.setDate(normalized.getDate() + amount);
  return normalized;
};

export const toIsoDate = (value: Date | string): string => {
  const normalized = normalizeDate(value);
  return normalized.toISOString().slice(0, 10);
};

export const toLongDate = (value: Date | string): string =>
  new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(normalizeDate(value));

export const todayPlusDays = (amount: number): string =>
  toIsoDate(addDays(new Date(), amount));

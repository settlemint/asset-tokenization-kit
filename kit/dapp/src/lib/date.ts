import { format, formatDistance, formatRelative, fromUnixTime, parseISO } from 'date-fns';

const NUMERIC_REGEX = /^\d+$/;

/**
 * Options for date formatting
 */
export interface DateFormatOptions {
  /** Format type: absolute (default), relative, distance, or unix */
  readonly type?: 'absolute' | 'relative' | 'distance' | 'unixSeconds';
  /** Custom format string for absolute dates (e.g., 'yyyy-MM-dd HH:mm') */
  readonly formatStr?: string;
}

/**
 * Formats a date string or Date object into a localized date-time string.
 * Uses Intl.DateTimeFormat for consistent localization.
 *
 * @param date - The date to format (string or Date object)
 * @param options - Formatting options including locale and format preferences
 * @returns Formatted date string or 'Invalid Date' if the input is invalid
 */
export function formatDate(date: string | Date, options: DateFormatOptions = {}): string {
  const { type = 'absolute', formatStr = 'MMMM d, yyyy HH:mm' } = options;

  try {
    const dateObj =
      typeof date === 'string'
        ? NUMERIC_REGEX.test(date)
          ? fromUnixTime(Number.parseInt(date, 10))
          : parseISO(date)
        : date;

    if (Number.isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    if (type === 'distance') {
      return formatDistance(dateObj, new Date());
    }

    if (type === 'relative') {
      return formatRelative(dateObj, new Date());
    }

    if (type === 'unixSeconds') {
      return (dateObj.getTime() / 1000).toString();
    }

    return format(dateObj, formatStr);
  } catch {
    return 'Invalid Date';
  }
}

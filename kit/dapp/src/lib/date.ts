import { format, formatDistance, formatRelative } from 'date-fns';

/**
 * Options for date formatting
 */
export interface DateFormatOptions {
  /** Format type: absolute (default), relative, or distance */
  readonly type?: 'absolute' | 'relative' | 'distance';
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
    const dateObj = typeof date === 'string' ? new Date(normalizeTimestamp(date)) : date;

    if (Number.isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    if (type === 'distance') {
      return formatDistance(dateObj, new Date());
    }

    if (type === 'relative') {
      return formatRelative(dateObj, new Date());
    }

    return format(dateObj, formatStr);
  } catch {
    return 'Invalid Date';
  }
}

const NUMERIC_REGEX = /^\d+$/;

function normalizeTimestamp(timestamp: string): string {
  if (NUMERIC_REGEX.test(timestamp)) {
    const timestampNum = Number.parseInt(timestamp, 10);
    const date = new Date(timestampNum * (timestamp.length === 10 ? 1000 : 1));
    return date.toISOString();
  }
  return timestamp;
}

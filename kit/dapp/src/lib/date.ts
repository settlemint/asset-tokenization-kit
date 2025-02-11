import { formatRelative } from 'date-fns';

/**
 * Formats a date string or Date object into a localized date-time string.
 * Default format matches 'PPP HH:mm' from date-fns (e.g., "April 29, 2023 14:30")
 *
 * @param date - The date to format (string or Date object)
 * @returns Formatted date string or 'Invalid Date' if the input is invalid
 */

const NUMERIC_REGEX = /^\d+$/;

export function formatDate(date: string | Date, { relative = false, locale = 'en-US' }): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(normalizeTimestamp(date)) : date;

    if (Number.isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    if (relative) {
      return formatRelative(dateObj, new Date());
    }

    const dateFormatter = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    return dateFormatter.format(dateObj);
  } catch {
    return 'Invalid Date';
  }
}

function normalizeTimestamp(timestamp: string): string {
  if (NUMERIC_REGEX.test(timestamp)) {
    const timestampNum = Number.parseInt(timestamp, 10);
    const date = new Date(timestampNum * (timestamp.length === 10 ? 1000 : 1));
    return date.toISOString();
  }
  return timestamp;
}

import type { CollateralProofValidityDuration } from '@/app/(private)/admin/stablecoins/_components/create-form/schema';
import {
  format,
  formatDistance,
  formatDuration as formatDurationFns,
  formatRelative,
  fromUnixTime,
  parseISO,
} from 'date-fns';

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

/**
 * Converts CollateralProofValidityDuration enum values to seconds
 * @param duration - The duration value from CollateralProofValidityDuration enum
 * @returns The duration in seconds
 */
export function convertDurationToSeconds(duration: keyof typeof CollateralProofValidityDuration): number {
  switch (duration) {
    case 'OneHour':
      return 60 * 60;
    case 'OneDay':
      return 24 * 60 * 60;
    case 'OneWeek':
      return 7 * 24 * 60 * 60;
    case 'OneMonth':
      return 30 * 24 * 60 * 60;
    case 'OneYear':
      return 365 * 24 * 60 * 60;
    default:
      return 365 * 24 * 60 * 60;
  }
}

export function getDateFromTimestamp(timestampInput: string | number): Date {
  // Handle string timestamps
  if (typeof timestampInput === 'string') {
    // Try parsing as ISO string first
    const isoDate = new Date(timestampInput);
    if (!Number.isNaN(isoDate.getTime())) {
      return isoDate;
    }
    // If not ISO, convert to number
    const numericTimestamp = Number(timestampInput);
    return getDateFromTimestamp(numericTimestamp);
  }

  // Now handle numeric timestamps
  const timestampStr = timestampInput.toString();

  // Microseconds (16 digits)
  if (timestampStr.length >= 16) {
    return new Date(timestampInput / 1000);
  }

  // Milliseconds (13 digits)
  if (timestampStr.length >= 13) {
    return new Date(timestampInput);
  }

  // Seconds (10 digits)
  if (timestampStr.length >= 10) {
    return new Date(timestampInput * 1000);
  }

  throw new Error(`Invalid timestamp format: ${timestampInput}`);
}

export function formatDuration(duration: number | string) {
  return formatDurationFns({
    years: Math.floor(Number(duration) / 31536000),
    months: Math.floor((Number(duration) % 31536000) / 2592000),
    days: Math.floor(((Number(duration) % 31536000) % 2592000) / 86400),
    hours: Math.floor((((Number(duration) % 31536000) % 2592000) % 86400) / 3600),
    minutes: Math.floor(((((Number(duration) % 31536000) % 2592000) % 86400) % 3600) / 60),
    seconds: ((((Number(duration) % 31536000) % 2592000) % 86400) % 3600) % 60,
  });
}

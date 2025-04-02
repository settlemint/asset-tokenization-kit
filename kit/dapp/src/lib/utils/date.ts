import {
  addHours,
  formatDistance,
  formatDuration as formatDurationFns,
  formatRelative,
  fromUnixTime,
  isBefore,
  parseISO,
  setDefaultOptions
} from "date-fns";
import { ar, de, ja } from "date-fns/locale";
import {
  createFormatter,
  type DateTimeFormatOptions,
  type Locale,
  useFormatter,
} from "next-intl";
import type { TimeUnit } from "./typebox/time-units";

const NUMERIC_REGEX = /^\d+$/;
const timeZone = "Europe/Brussels";

/**
 * Options for date formatting
 */
export interface DateFormatOptions {
  /** Format type: absolute (default), relative, distance, or unix */
  readonly type?: "absolute" | "relative" | "distance" | "unixSeconds";
  /** The locale to use for formatting (e.g., 'en-US') */
  readonly locale?: Locale;
  /** Custom format options for absolute dates */
  readonly formatOptions?: DateTimeFormatOptions;
}

/**
 * Internal helper to format dates with a given formatter
 */
function formatDateWithFormatter(
  formatter:
    | ReturnType<typeof useFormatter>
    | ReturnType<typeof createFormatter>,
  date: Date,
  options: DateFormatOptions
): string {
  const { type = "absolute" } = options;

  if (type === "distance") {
    return formatDistance(date, new Date());
  }

  if (type === "relative") {
    return formatRelative(date, new Date());
  }

  if (type === "unixSeconds") {
    return (date.getTime() / 1000).toString();
  }

  return formatter.dateTime(date, {
    dateStyle: "long",
    timeStyle: "short",
    ...options.formatOptions,
  });
}

/**
 * Formats a date string or Date object into a localized date-time string.
 * Uses next-intl formatter for consistent localization.
 *
 * @param date - The date to format (string or Date object)
 * @param options - Formatting options including locale and format preferences
 * @returns Formatted date string or 'Invalid Date' if the input is invalid
 */
export function formatDate(
  date: string | Date,
  options: DateFormatOptions = {}
): string {
  try {
    const dateObj =
      typeof date === "string"
        ? NUMERIC_REGEX.test(date)
          ? fromUnixTime(Number.parseInt(date, 10))
          : parseISO(date)
        : date;

    if (Number.isNaN(dateObj.getTime())) {
      return "-";
    }

    const locale = options.locale || "en";

    if (locale !== "en") {
      if (locale === "de") {
        setDefaultOptions({ locale: de });
      } else if (locale === "ja") {
        setDefaultOptions({ locale: ja });
      } else if (locale === "ar") {
        setDefaultOptions({ locale: ar });
      }
    }

    const formatter = createFormatter({
      locale: locale,
      timeZone: timeZone,
    });

    return formatDateWithFormatter(formatter, dateObj, options);
  } catch {
    return "-";
  }
}

export function formatDuration(duration: number | string) {
  return formatDurationFns({
    years: Math.floor(Number(duration) / 31536000),
    months: Math.floor((Number(duration) % 31536000) / 2592000),
    days: Math.floor(((Number(duration) % 31536000) % 2592000) / 86400),
    hours: Math.floor(
      (((Number(duration) % 31536000) % 2592000) % 86400) / 3600
    ),
    minutes: Math.floor(
      ((((Number(duration) % 31536000) % 2592000) % 86400) % 3600) / 60
    ),
    seconds: ((((Number(duration) % 31536000) % 2592000) % 86400) % 3600) % 60,
  });
}

/**
 * Converts any timestamp format to a JavaScript Date object.
 * Supports:
 * - Unix seconds (10 digits)
 * - Unix milliseconds (13 digits)
 * - Unix microseconds (16 digits)
 * - ISO date strings
 * - Date objects
 *
 * @param timestamp - The timestamp to convert
 * @returns A JavaScript Date object
 * @throws {Error} If the timestamp is invalid or cannot be parsed
 */
export function getDateFromTimestamp(timestamp: string | number | Date): Date {
  if (timestamp instanceof Date) {
    return timestamp;
  }

  // Try parsing as ISO string first if it's a string
  if (typeof timestamp === "string") {
    const date = new Date(timestamp);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  const numericTimestamp = Number(timestamp);
  if (Number.isNaN(numericTimestamp)) {
    throw new Error("Invalid timestamp format");
  }

  const timestampStr = String(numericTimestamp);

  // Unix microseconds (16 digits)
  if (timestampStr.length >= 16) {
    return new Date(Math.floor(numericTimestamp / 1000));
  }

  // Unix milliseconds (13 digits)
  if (timestampStr.length >= 13) {
    return new Date(numericTimestamp);
  }

  // Unix seconds (10 digits or less)
  return new Date(numericTimestamp * 1000);
}

export function getTimeUnitSeconds(unit: TimeUnit): number {
  switch (unit) {
    case "seconds":
      return 1;
    case "hours":
      return 3600;
    case "days":
      return 86400;
    case "weeks":
      return 604800;
    case "months":
      return 2592000; // 30 days
  }
}

/**
 * Formats a Date object for usage in datetime-local input elements
 * Returns a string in the format "YYYY-MM-DDThh:mm"
 *
 * @param date - The date to format
 * @returns String formatted for datetime-local inputs
 */
export function formatForDatetimeLocal(date: Date): string {
  return (
    date.toLocaleDateString("sv").replace(/\//g, "-") +
    "T" +
    date.toLocaleTimeString("sv").slice(0, 5)
  );
}

/**
 * Returns a Date object that is a specified number of hours in the future
 * Also provides the formatted string for datetime-local inputs
 *
 * @param hours - Number of hours in the future (default: 1)
 * @returns Object containing the Date and its formatted string
 */
export function getMinFutureDate(hours: number = 1): {
  date: Date;
  formatted: string;
} {
  const futureDate = addHours(new Date(), hours);
  return {
    date: futureDate,
    formatted: formatForDatetimeLocal(futureDate)
  };
}

/**
 * Validates if a date string or Date object is at least the specified number of hours in the future
 * Can also update a form value if provided
 *
 * @param date - Date to validate (string from datetime-local input or Date object)
 * @param hours - Minimum hours in the future (default: 1)
 * @returns Boolean indicating if the date is valid
 */
export function validateFutureDate(
  date: string | Date,
  hours: number = 1,
): boolean {
  const selectedDate = typeof date === 'string' ? new Date(date) : date;
  const minDate = getMinFutureDate(hours);

  if (isBefore(selectedDate, minDate.date)) {
    return false;
  }

  return true;
}

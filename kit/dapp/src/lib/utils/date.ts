import {
  addDays,
  addHours,
  formatDistance,
  formatDuration as formatDurationFns,
  formatRelative,
  fromUnixTime,
  isFuture,
  parseISO,
  startOfDay,
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
    const localeObj = getLocaleSetting(options.locale || "en");
    return formatDistance(date, new Date(), { locale: localeObj });
  }

  if (type === "relative") {
    const localeObj = getLocaleSetting(options.locale || "en");
    return formatRelative(date, new Date(), { locale: localeObj });
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
 * Helper function to get the appropriate date-fns locale object
 */
function getLocaleSetting(locale: string) {
  switch (locale) {
    case "de":
      return de;
    case "ja":
      return ja;
    case "ar":
      return ar;
    default:
      return undefined; // date-fns defaults to English when locale is undefined
  }
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
    default:
      throw new Error("Unsupported time unit");
  }
}

/**
 * Generates a formatted date string for a future date with specified hours offset
 * Returns date in ISO-like format: "YYYY-MM-DDThh:mm"
 *
 * @param hoursFromNow - Number of hours from current time (default: 1)
 * @returns Formatted date string suitable for datetime inputs
 */
export function getFormattedFutureDate(hoursFromNow = 1): string {
  const futureDate = addHours(new Date(), hoursFromNow);
  return formatToDateTimeInput(futureDate);
}

/**
 * Generates a formatted date string for tomorrow at midnight (00:00)
 * Returns date in ISO-like format: "YYYY-MM-DDT00:00"
 *
 * @returns Formatted date string suitable for datetime inputs
 */
export function getTomorrowMidnight(): string {
  const tomorrow = startOfDay(addDays(new Date(), 1));
  return formatToDateTimeInput(tomorrow);
}

/**
 * Formats a Date object to ISO-like string suitable for datetime-local inputs
 * Format: "YYYY-MM-DDThh:mm"
 *
 * @param date - The date to format
 * @returns Formatted date string for datetime inputs
 */
export function formatToDateTimeInput(date: Date): string {
  return (
    date.toLocaleDateString("sv").replace(/\//g, "-") +
    "T" +
    date.toLocaleTimeString("sv").slice(0, 5)
  );
}

/**
 * Validates if a date is in the future and at least a specified number of hours from now
 *
 * @param date - The date to validate (string or Date object)
 * @param minHoursInFuture - Minimum hours the date must be in the future (default: 0)
 * @returns true if date is valid and meets the criteria, false otherwise
 */
export function isValidFutureDate(
  date: string | Date,
  minHoursInFuture = 0
): boolean {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (Number.isNaN(dateObj.getTime())) {
      return false;
    }

    const minDate = addHours(new Date(), minHoursInFuture);
    return isFuture(dateObj) && dateObj >= minDate;
  } catch {
    return false;
  }
}

import { format as formatDateFns } from "date-fns";
import { getDateLocale } from "./date-locale";

/**
 * Format a date using the user's locale
 * @param date - The date to format
 * @param options - Either a date-fns format string or Intl.DateTimeFormat options
 * @param locale - The locale string (e.g. "en", "de", "ar", "ja")
 * @returns The formatted date string
 */
export function formatDate(
  date: Date | string | number,
  options: string | Intl.DateTimeFormatOptions = "MMM d, yyyy",
  locale?: string
): string {
  const dateObj = typeof date === "object" ? date : new Date(date);

  // If options is a string, use date-fns formatting
  if (typeof options === "string") {
    const dateLocale = locale ? getDateLocale(locale) : undefined;
    return formatDateFns(dateObj, options, { locale: dateLocale });
  }

  // Otherwise, use Intl.DateTimeFormat
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

/**
 * Format a date range using the user's locale
 * @param start - The start date
 * @param end - The end date
 * @param locale - The locale string
 * @returns The formatted date range string
 */
export function formatDateRange(
  start: Date | string | number,
  end: Date | string | number,
  locale?: string
): string {
  const startDate = typeof start === "object" ? start : new Date(start);
  const endDate = typeof end === "object" ? end : new Date(end);
  const dateLocale = locale ? getDateLocale(locale) : undefined;

  const sameMonth = startDate.getMonth() === endDate.getMonth();
  const sameYear = startDate.getFullYear() === endDate.getFullYear();

  if (sameMonth && sameYear) {
    return `${formatDateFns(startDate, "MMM d", { locale: dateLocale })} - ${formatDateFns(endDate, "d, yyyy", { locale: dateLocale })}`;
  }

  if (sameYear) {
    return `${formatDateFns(startDate, "MMM d", { locale: dateLocale })} - ${formatDateFns(endDate, "MMM d, yyyy", { locale: dateLocale })}`;
  }

  return `${formatDateFns(startDate, "MMM d, yyyy", { locale: dateLocale })} - ${formatDateFns(endDate, "MMM d, yyyy", { locale: dateLocale })}`;
}

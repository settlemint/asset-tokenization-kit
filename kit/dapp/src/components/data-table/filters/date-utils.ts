import { formatDate } from "date-fns";
import { getDateLocale } from "@/lib/utils/date-locale";

export function formatDateRange(start: Date, end: Date, locale: string) {
  const sameMonth = start.getMonth() === end.getMonth();
  const sameYear = start.getFullYear() === end.getFullYear();
  const dateLocale = getDateLocale(locale);

  if (sameMonth && sameYear) {
    return `${formatDate(start, "MMM d", { locale: dateLocale })} - ${formatDate(end, "d, yyyy", { locale: dateLocale })}`;
  }

  if (sameYear) {
    return `${formatDate(start, "MMM d", { locale: dateLocale })} - ${formatDate(end, "MMM d, yyyy", { locale: dateLocale })}`;
  }

  return `${formatDate(start, "MMM d, yyyy", { locale: dateLocale })} - ${formatDate(end, "MMM d, yyyy", { locale: dateLocale })}`;
}

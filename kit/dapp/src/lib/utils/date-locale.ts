import { enUS, de, ar, ja } from "date-fns/locale";
import type { Locale } from "date-fns";

/**
 * Map of supported locales to date-fns locale objects
 */
const localeMap: Record<string, Locale> = {
  en: enUS,
  "en-US": enUS,
  de: de,
  "de-DE": de,
  ar: ar,
  "ar-SA": ar,
  ja: ja,
  "ja-JP": ja,
};

/**
 * Get the date-fns locale object for a given locale string
 * @param locale - The locale string (e.g., "en", "de", "ar", "ja")
 * @returns The date-fns locale object, or undefined for default locale
 */
export function getDateLocale(locale?: string): Locale | undefined {
  if (!locale) {
    return undefined;
  }

  // Try exact match first
  if (localeMap[locale]) {
    return localeMap[locale];
  }

  // Try language code only (e.g., "en" from "en-US")
  const languageCode = locale.split("-")[0];
  if (languageCode && localeMap[languageCode]) {
    return localeMap[languageCode];
  }

  // Return undefined to use default locale
  return undefined;
}

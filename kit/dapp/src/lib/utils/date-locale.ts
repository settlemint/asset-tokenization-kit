/**
 * Date locale utilities for mapping i18n language codes to date-fns locales.
 * 
 * This module provides functionality to map i18n language codes (e.g., 'en', 'de')
 * to their corresponding date-fns locale objects for proper date formatting
 * and localization support.
 * 
 * @see https://date-fns.org/docs/I18n - date-fns internationalization
 */

import type { Locale } from "date-fns";
import { enUS, de, ar, ja } from "date-fns/locale";

/**
 * Mapping of i18n language codes to date-fns locale objects.
 * 
 * This ensures date formatting matches the user's selected language.
 * Only includes locales that are actually available in date-fns.
 */
const localeMap: Record<string, Locale> = {
  en: enUS,
  de,
  ar,
  ja,
} as const;

/**
 * Supported language codes for date localization.
 * Derived from the locale map to ensure consistency.
 */
export const supportedDateLocales = Object.keys(localeMap);

/**
 * Gets the appropriate date-fns locale for the given language code.
 * 
 * @param languageCode - The i18n language code (e.g., 'en', 'de', 'ar', 'ja')
 * @returns The corresponding date-fns locale object, defaults to enUS if not found
 * 
 * @example
 * ```typescript
 * import { format } from 'date-fns';
 * import { getDateLocale } from '@/lib/utils/date-locale';
 * 
 * const locale = getDateLocale('de');
 * const formattedDate = format(new Date(), 'PPP', { locale });
 * ```
 */
export function getDateLocale(languageCode: string): Locale {
  return localeMap[languageCode] ?? enUS;
}

/**
 * Type guard to check if a language code has date locale support.
 * 
 * @param languageCode - The language code to check
 * @returns True if the language code is supported for date localization
 */
export function isDateLocaleSupported(languageCode: string): languageCode is keyof typeof localeMap {
  return languageCode in localeMap;
}
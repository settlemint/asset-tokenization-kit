/**
 * ISO 3166-1 Alpha-2 Country Code Validation
 *
 * This module provides Zod schemas for validating ISO 3166-1 alpha-2 country codes
 * using the i18n-iso-countries library to ensure only valid country codes are accepted.
 *
 * @module ISOCountryCodeValidation
 */

// biome-ignore lint/performance/noNamespaceImport: required to use i18n-iso-countries
import * as countries from 'i18n-iso-countries';
// Preload supported locales
import localeAr from 'i18n-iso-countries/langs/ar.json' with { type: 'json' };
import localeDe from 'i18n-iso-countries/langs/de.json' with { type: 'json' };
import localeEn from 'i18n-iso-countries/langs/en.json' with { type: 'json' };
import localeJa from 'i18n-iso-countries/langs/ja.json' with { type: 'json' };
import { z } from 'zod/v4';

// Register all supported locales at module initialization
countries.registerLocale(localeEn);
countries.registerLocale(localeAr);
countries.registerLocale(localeDe);
countries.registerLocale(localeJa);

/**
 * Supported locale codes for country name translations.
 */
export type SupportedLocale = 'en' | 'ar' | 'de' | 'ja';

/**
 * Array of supported locale codes.
 */
export const SUPPORTED_LOCALES: readonly SupportedLocale[] = [
  'en',
  'ar',
  'de',
  'ja',
] as const;

/**
 * Array of all valid ISO 3166-1 alpha-2 country codes.
 * Generated from the i18n-iso-countries library.
 */
const validCountryCodes = Object.keys(countries.getAlpha2Codes()) as [
  string,
  ...string[],
];

/**
 * Zod schema for ISO 3166-1 alpha-2 country codes.
 *
 * Validates that a string is a valid ISO 3166-1 alpha-2 country code
 * by checking against the complete list from i18n-iso-countries.
 *
 * @example
 * ```typescript
 * // Valid codes
 * isoCountryCode.parse("US"); // ✓ United States
 * isoCountryCode.parse("GB"); // ✓ United Kingdom
 * isoCountryCode.parse("JP"); // ✓ Japan
 *
 * // Invalid codes
 * isoCountryCode.parse("USA"); // ✗ Alpha-3 code
 * isoCountryCode.parse("XX");  // ✗ Not a valid country
 * isoCountryCode.parse("us");  // ✗ Lowercase
 * ```
 */
export const isoCountryCode = z
  .enum(validCountryCodes)
  .describe('ISO 3166-1 alpha-2 country code');

/**
 * Type representing a valid ISO 3166-1 alpha-2 country code.
 */
export type ISOCountryCode = z.infer<typeof isoCountryCode>;

/**
 * Get the country name for a given ISO 3166-1 alpha-2 code.
 *
 * @param code - The ISO 3166-1 alpha-2 country code
 * @param locale - The locale for the country name (default: "en")
 *                 Supported locales: "en", "ar", "de", "ja"
 * @returns The country name in the specified locale, or undefined if not found
 *
 * @example
 * ```typescript
 * getCountryName("US"); // "United States of America"
 * getCountryName("FR", "fr"); // "France"
 * getCountryName("DE", "de"); // "Deutschland"
 * getCountryName("JP", "ja"); // "日本"
 * ```
 */
export function getCountryName(
  code: string,
  locale: SupportedLocale = 'en'
): string | undefined {
  // All supported locales are pre-registered at module initialization
  return countries.getName(code, locale);
}

/**
 * Check if a string is a valid ISO 3166-1 alpha-2 country code.
 *
 * @param code - The string to check
 * @returns True if the code is valid, false otherwise
 *
 * @example
 * ```typescript
 * isValidCountryCode("US"); // true
 * isValidCountryCode("XX"); // false
 * ```
 */
export function isValidCountryCode(code: string): code is ISOCountryCode {
  return isoCountryCode.safeParse(code).success;
}

/**
 * Get all supported locales that have been preloaded.
 *
 * @returns Array of supported locale codes
 */
export function getSupportedLocales(): SupportedLocale[] {
  return [...SUPPORTED_LOCALES];
}

/**
 * ISO 3166-1 Country Code Validation
 *
 * This module provides Zod schemas for validating ISO 3166-1 country codes (both alpha-2 and numeric)
 * using the i18n-iso-countries library to ensure only valid country codes are accepted.
 * @module ISOCountryCodeValidation
 */

import countries from "i18n-iso-countries";
// Preload supported locales
import localeAr from "i18n-iso-countries/langs/ar.json";
import localeDe from "i18n-iso-countries/langs/de.json";
import localeEn from "i18n-iso-countries/langs/en.json";
import localeJa from "i18n-iso-countries/langs/ja.json";
import { z } from "zod";

const { registerLocale, getAlpha2Codes, getName } = countries;

// Register all supported locales at module initialization
registerLocale(localeEn);
registerLocale(localeAr);
registerLocale(localeDe);
registerLocale(localeJa);

/**
 * Supported locale codes for country name translations.
 */
export type SupportedLocale = "en" | "ar" | "de" | "ja";

/**
 * Array of supported locale codes.
 */
export const SUPPORTED_LOCALES: readonly SupportedLocale[] = ["en", "ar", "de", "ja"] as const;

/**
 * Array of all valid ISO 3166-1 alpha-2 country codes.
 * Generated from the i18n-iso-countries library.
 */
const validCountryCodes = Object.keys(getAlpha2Codes()) as [string, ...string[]];

/**
 * Array of all valid ISO 3166-1 numeric country codes as strings.
 * Generated from the i18n-iso-countries library.
 */
const validNumericCountryCodes = Object.keys(countries.getNumericCodes()) as [string, ...string[]];

/**
 * Array of all valid ISO 3166-1 numeric country codes as numbers.
 * Generated from the i18n-iso-countries library.
 */
const validNumericCountryCodesAsNumbers = validNumericCountryCodes.map((code) => Number.parseInt(code, 10)) as [
  number,
  ...number[],
];

/**
 * Zod schema for ISO 3166-1 alpha-2 country codes.
 *
 * Validates that a string is a valid ISO 3166-1 alpha-2 country code
 * by checking against the complete list from i18n-iso-countries.
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
export const isoCountryCode = z.enum(validCountryCodes).describe("ISO 3166-1 alpha-2 country code");

/**
 * Zod schema for ISO 3166-1 numeric country codes.
 *
 * Accepts both string and number inputs, always outputs a number.
 * Validates against the complete list from i18n-iso-countries.
 * @example
 * ```typescript
 * // Valid inputs (all output numbers)
 * isoCountryCodeNumeric.parse("840"); // ✓ 840 (United States)
 * isoCountryCodeNumeric.parse(840);   // ✓ 840 (United States)
 * isoCountryCodeNumeric.parse("056"); // ✓ 56 (Belgium)
 * isoCountryCodeNumeric.parse(56);    // ✓ 56 (Belgium)
 *
 * // Invalid codes
 * isoCountryCodeNumeric.parse("999"); // ✗ Not a valid numeric code
 * isoCountryCodeNumeric.parse(999);   // ✗ Not a valid numeric code
 * isoCountryCodeNumeric.parse("XX");  // ✗ Not numeric
 * ```
 */
export const isoCountryCodeNumeric = z
  .union([
    z.enum(validNumericCountryCodes), // accepts "840", "056", etc.
    z.literal(validNumericCountryCodesAsNumbers), // accepts 840, 56, etc.
  ])
  .pipe(z.coerce.number())
  .describe("ISO 3166-1 numeric country code");

/**
 * Type representing a valid ISO 3166-1 alpha-2 country code.
 */
export type ISOCountryCode = z.infer<typeof isoCountryCode>;

/**
 * Type representing a valid ISO 3166-1 numeric country code (as number).
 */
export type ISOCountryCodeNumeric = z.infer<typeof isoCountryCodeNumeric>;

/**
 * Get the country name for a given ISO 3166-1 alpha-2 code.
 * @param code - The ISO 3166-1 alpha-2 country code
 * @param locale - The locale for the country name (default: "en")
 *                 Supported locales: "en", "ar", "de", "ja"
 * @returns The country name in the specified locale, or undefined if not found
 * @example
 * ```typescript
 * getCountryName("US"); // "United States of America"
 * getCountryName("FR", "fr"); // "France"
 * getCountryName("DE", "de"); // "Deutschland"
 * getCountryName("JP", "ja"); // "日本"
 * ```
 */
export function getCountryName(code: string, locale: SupportedLocale = "en"): string | undefined {
  // All supported locales are pre-registered at module initialization
  return getName(code, locale);
}

/**
 * Check if a string is a valid ISO 3166-1 alpha-2 country code.
 * @param code - The string to check
 * @returns True if the code is valid, false otherwise
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
 * @returns Array of supported locale codes
 */
export function getSupportedLocales(): SupportedLocale[] {
  return [...SUPPORTED_LOCALES];
}

/**
 * Get all countries with their names in the specified locale.
 * @param locale - The locale for the country names (default: "en")
 *                 Supported locales: "en", "ar", "de", "ja"
 * @returns Object with country codes as keys and country names as values
 */
export function getCountries(locale: SupportedLocale = "en") {
  return countries.getNames(locale);
}

export function getNumericCodeByName(name: string, locale: SupportedLocale = "en") {
  const alpha2Code = countries.getAlpha2Code(name, locale);
  if (!alpha2Code) {
    return undefined;
  }

  return countries.alpha2ToNumeric(alpha2Code);
}

/**
 * Get all numeric country codes with their corresponding country names.
 * @param locale - The locale for the country names (default: "en")
 *                 Supported locales: "en", "ar", "de", "ja"
 * @returns Object with numeric codes as keys and country names as values
 * @example
 * ```typescript
 * getNumericCountries("en");
 * // { "840": "United States of America", "826": "United Kingdom", ... }
 * ```
 */
export function getNumericCountries(locale: SupportedLocale = "en") {
  const numericCodes = countries.getNumericCodes();
  const result: Record<string, string> = {};

  for (const [numeric, alpha2] of Object.entries(numericCodes)) {
    result[numeric] = getName(alpha2, locale) ?? alpha2;
  }

  return result;
}

/**
 * Get all countries with their names in the specified locale, sorted alphabetically by country name.
 * @param locale - The locale for the country names (default: "en")
 *                 Supported locales: "en", "ar", "de", "ja"
 * @returns Array of [countryCode, countryName] entries, sorted alphabetically by country name
 */
export function getCountriesSorted(locale: SupportedLocale = "en") {
  const countries = getCountries(locale);
  return Object.entries(countries).sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB));
}

/**
 * Get all numeric country codes with their corresponding country names, sorted alphabetically by country name.
 * @param locale - The locale for the country names (default: "en")
 *                 Supported locales: "en", "ar", "de", "ja"
 * @returns Array of [numericCode, countryName] entries, sorted alphabetically by country name
 * @example
 * ```typescript
 * getNumericCountriesSorted("en");
 * // [["040", "Austria"], ["056", "Belgium"], ["840", "United States of America"], ...]
 * ```
 */
export function getNumericCountriesSorted(locale: SupportedLocale = "en") {
  const numericCountries = getNumericCountries(locale);
  return Object.entries(numericCountries).sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB));
}

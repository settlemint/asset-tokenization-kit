/**
 * Fiat Currency Validation Utilities
 *
 * This module provides Zod schemas for validating ISO 4217 fiat currency codes,
 * commonly used in financial applications for representing traditional currencies
 * in digital asset platforms and stablecoin systems.
 * @module FiatCurrencyValidation
 */
import * as cc from "currency-codes";
import * as z from "zod";

/**
 * Get all valid ISO 4217 currency codes.
 * Filters out cryptocurrencies and test currencies.
 */
function getValidFiatCurrencies(): string[] {
  return cc.codes().filter((code) => {
    const currency = cc.code(code);
    if (!currency) return false;

    // Exclude test currencies (XTS), precious metals (XAU, XAG, etc.),
    // and special drawing rights (XDR)
    if (code.startsWith("X")) return false;

    // Exclude currencies without decimal information
    return typeof currency.digits === "number";
  });
}

/**
 * All valid fiat currency codes from ISO 4217.
 * Dynamically generated from currency-codes package.
 */
export const allFiatCurrencies = getValidFiatCurrencies();

/**
 * Supported fiat currency codes for the platform.
 * A curated subset of major global currencies.
 */
export const fiatCurrencies = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CHF",
  "CAD",
  "AUD",
  "AED",
  "SGD",
  "SAR",
] as const;

/**
 * Get currency metadata from ISO 4217 data.
 * @param code - Currency code
 * @returns Currency metadata or undefined
 */
export function getCurrencyMetadata(
  code: string
): { name: string; decimals: number } | undefined {
  const currency = cc.code(code);
  if (!currency) return undefined;

  return {
    name: currency.currency,
    decimals: typeof currency.digits === "number" ? currency.digits : 2,
  };
}

/**
 * Currency metadata for supported fiat currencies.
 * Dynamically generated from currency-codes package.
 */
export const fiatCurrencyMetadata = Object.fromEntries(
  fiatCurrencies.map((code) => {
    const metadata = getCurrencyMetadata(code);
    return [code, metadata ?? { name: code, decimals: 2 }];
  })
) as Record<FiatCurrency, { name: string; decimals: number }>;

/**
 * Creates a Zod schema that validates fiat currency codes.
 * Only accepts uppercase ISO 4217 currency codes.
 * @returns A Zod schema for fiat currency validation
 * @example
 * ```typescript
 * const schema = fiatCurrency();
 *
 * // Valid currencies (must be uppercase)
 * schema.parse("USD");  // "USD"
 * schema.parse("EUR");  // "EUR"
 * schema.parse("GBP");  // "GBP"
 *
 * // Invalid currencies
 * schema.parse("usd");  // Throws - must be uppercase
 * schema.parse("BTC");  // Throws - cryptocurrency
 * schema.parse("CNY");  // Throws - not in supported list
 * ```
 */
export const fiatCurrency = () =>
  z.enum(fiatCurrencies).describe("Fiat currency code (ISO 4217)");

/**
 * Type representing a validated fiat currency code.
 * Uses the literal union type from the const array for better type safety.
 */
export type FiatCurrency = (typeof fiatCurrencies)[number];

/**
 * Type guard to check if a value is a valid fiat currency.
 * @param value - The value to check
 * @returns `true` if the value is a valid fiat currency, `false` otherwise
 * @example
 * ```typescript
 * const userInput: unknown = "EUR";
 * if (isFiatCurrency(userInput)) {
 *   // TypeScript knows userInput is FiatCurrency
 *   console.log(`Valid currency: ${userInput}`); // "EUR"
 *
 *   // Apply currency-specific logic
 *   if (userInput === "JPY") {
 *     // No decimal places for Japanese Yen
 *     setDecimals(0);
 *   }
 * }
 * ```
 */
export function isFiatCurrency(value: unknown): value is FiatCurrency {
  return fiatCurrency().safeParse(value).success;
}

/**
 * Safely parse and return a fiat currency or throw an error.
 * @param value - The value to parse as a fiat currency
 * @returns The validated fiat currency code
 * @throws {Error} If the value is not a valid fiat currency
 * @example
 * ```typescript
 * try {
 *   const currency = getFiatCurrency("USD"); // Returns "USD"
 *   const invalid = getFiatCurrency("BTC"); // Throws Error
 *   const lowercase = getFiatCurrency("usd"); // Throws Error - must be uppercase
 * } catch (error) {
 *   console.error("Invalid fiat currency provided");
 * }
 *
 * // Use in stablecoin configuration
 * const baseCurrency = getFiatCurrency(config.currency);
 * createStablecoin(baseCurrency, amount);
 * ```
 */
export function getFiatCurrency(value: unknown): FiatCurrency {
  return fiatCurrency().parse(value);
}

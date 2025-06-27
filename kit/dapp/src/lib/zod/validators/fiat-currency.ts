/**
 * Fiat Currency Validation Utilities
 *
 * This module provides Zod schemas for validating ISO 4217 fiat currency codes,
 * commonly used in financial applications for representing traditional currencies
 * in digital asset platforms and stablecoin systems.
 *
 * @module FiatCurrencyValidation
 */
import { z } from 'zod/v4';

/**
 * Supported fiat currency codes (ISO 4217).
 *
 * @remarks
 * Major global currencies supported by the platform:
 * - `USD`: United States Dollar
 * - `EUR`: Euro
 * - `GBP`: British Pound Sterling
 * - `JPY`: Japanese Yen
 * - `CHF`: Swiss Franc
 * - `CAD`: Canadian Dollar
 * - `AUD`: Australian Dollar
 */
export const fiatCurrencies = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CHF',
  'CAD',
  'AUD',
] as const;

/**
 * Creates a Zod schema that validates fiat currency codes.
 * Automatically converts input to uppercase before validation.
 *
 * @returns A Zod schema for fiat currency validation
 *
 * @example
 * ```typescript
 * const schema = fiatCurrency();
 *
 * // Valid currencies (case-insensitive)
 * schema.parse("USD");  // "USD"
 * schema.parse("usd");  // "USD" (converted to uppercase)
 * schema.parse("eur");  // "EUR"
 * schema.parse("GBP");  // "GBP"
 *
 * // Invalid currencies
 * schema.parse("BTC");  // Throws - cryptocurrency
 * schema.parse("CNY");  // Throws - not in supported list
 * ```
 */
export const fiatCurrency = () =>
  z
    .string()
    .transform((val) => val.toUpperCase()) // Normalize to uppercase
    .pipe(z.enum(fiatCurrencies)) // Validate against allowed currencies
    .describe('Fiat currency code');

/**
 * Type representing a validated fiat currency code.
 * Ensures type safety.
 */
export type FiatCurrency = z.infer<ReturnType<typeof fiatCurrency>>;

/**
 * Type guard to check if a value is a valid fiat currency.
 *
 * @param value - The value to check
 * @returns `true` if the value is a valid fiat currency, `false` otherwise
 *
 * @example
 * ```typescript
 * const userInput: unknown = "eur";
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
 *
 * @param value - The value to parse as a fiat currency
 * @returns The validated fiat currency code (uppercase)
 * @throws {Error} If the value is not a valid fiat currency
 *
 * @example
 * ```typescript
 * try {
 *   const currency = getFiatCurrency("usd"); // Returns "USD"
 *   const invalid = getFiatCurrency("BTC"); // Throws Error
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

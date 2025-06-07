/**
 * Amount Validation Utilities
 *
 * This module provides Zod-based validation for numerical amounts
 * with configurable boundaries, matching the TypeBox amount validator.
 *
 * @module AmountValidation
 */
import { z } from "zod";

/**
 * Options for the Amount schema
 */
export interface AmountOptions {
  min?: number;
  max?: number;
  decimals?: number;
}

/**
 * Validates a positive amount with specific boundaries
 *
 * @param options - Configuration options for amount validation
 * @param options.min - Minimum allowed value (defaults based on decimals or 0)
 * @param options.max - Maximum allowed value (defaults to Number.MAX_SAFE_INTEGER)
 * @param options.decimals - Used to calculate minimum if min not provided
 * @returns A Zod schema that validates positive amounts with specific boundaries
 */
export const amount = ({
  max = Number.MAX_SAFE_INTEGER,
  min,
  decimals,
}: AmountOptions = {}) => {
  const minimum =
    typeof min === "number"
      ? min
      : typeof decimals === "number"
        ? 10 ** -decimals
        : 0;

  return z
    .number()
    .min(minimum, `Must be at least ${minimum}`)
    .max(max, `Must be at most ${max}`)
    .describe(`A positive numerical amount between ${minimum} and ${max}`);
};

/**
 * Validates a monetary amount (2 decimal places)
 */
export const monetaryAmount = (options: Omit<AmountOptions, "decimals"> = {}) =>
  amount({ ...options, decimals: 2 }).describe(
    "A monetary amount with 2 decimal places"
  );

/**
 * Validates a percentage (0-100, 2 decimal places)
 */
export const percentage = (
  options: Omit<AmountOptions, "min" | "max" | "decimals"> = {}
) =>
  amount({
    ...options,
    min: 0,
    max: 100,
    decimals: 2,
  }).describe(
    "A percentage value between 0 and 100 with up to 2 decimal places"
  );

/**
 * Validates a whole number amount (no decimals)
 */
export const wholeAmount = (options: Omit<AmountOptions, "decimals"> = {}) =>
  z
    .number()
    .int("Amount must be a whole number")
    .pipe(amount({ ...options, decimals: 0 }))
    .describe("A positive whole number amount (no decimals)");

/**
 * Validates cryptocurrency amounts (up to 18 decimals)
 */
export const cryptoAmount = (options: Omit<AmountOptions, "decimals"> = {}) =>
  amount({ ...options, decimals: 18 }).describe(
    "A cryptocurrency amount with up to 18 decimal places"
  );

// Export types
export type Amount = z.infer<ReturnType<typeof amount>>;
export type MonetaryAmount = z.infer<ReturnType<typeof monetaryAmount>>;
export type Percentage = z.infer<ReturnType<typeof percentage>>;
export type WholeAmount = z.infer<ReturnType<typeof wholeAmount>>;
export type CryptoAmount = z.infer<ReturnType<typeof cryptoAmount>>;

// Helper functions

/**
 * Type guard function to check if a value is a valid amount
 */
export function isAmount(
  value: unknown,
  options?: AmountOptions
): value is Amount {
  return amount(options).safeParse(value).success;
}

/**
 * Safely parse and validate an amount with error throwing
 */
export function getAmount(value: unknown, options?: AmountOptions): Amount {
  const result = amount(options).safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid amount: ${value}`);
  }
  return result.data;
}

/**
 * Type guard to check if a value is a valid monetary amount
 */
export function isMonetaryAmount(
  value: unknown,
  options?: Omit<AmountOptions, "decimals">
): value is MonetaryAmount {
  return monetaryAmount(options).safeParse(value).success;
}

/**
 * Safely parse and return a monetary amount or throw an error
 */
export function getMonetaryAmount(
  value: unknown,
  options?: Omit<AmountOptions, "decimals">
): MonetaryAmount {
  const result = monetaryAmount(options).safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid monetary amount: ${value}`);
  }
  return result.data;
}

/**
 * Type guard to check if a value is a valid percentage
 */
export function isPercentage(value: unknown): value is Percentage {
  return percentage().safeParse(value).success;
}

/**
 * Safely parse and return a percentage or throw an error
 */
export function getPercentage(value: unknown): Percentage {
  const result = percentage().safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid percentage: ${value}`);
  }
  return result.data;
}

/**
 * Type guard to check if a value is a valid whole amount
 */
export function isWholeAmount(
  value: unknown,
  options?: Omit<AmountOptions, "decimals">
): value is WholeAmount {
  return wholeAmount(options).safeParse(value).success;
}

/**
 * Safely parse and return a whole amount or throw an error
 */
export function getWholeAmount(
  value: unknown,
  options?: Omit<AmountOptions, "decimals">
): WholeAmount {
  const result = wholeAmount(options).safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid whole amount: ${value}`);
  }
  return result.data;
}

/**
 * Type guard to check if a value is a valid crypto amount
 */
export function isCryptoAmount(
  value: unknown,
  options?: Omit<AmountOptions, "decimals">
): value is CryptoAmount {
  return cryptoAmount(options).safeParse(value).success;
}

/**
 * Safely parse and return a crypto amount or throw an error
 */
export function getCryptoAmount(
  value: unknown,
  options?: Omit<AmountOptions, "decimals">
): CryptoAmount {
  const result = cryptoAmount(options).safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid crypto amount: ${value}`);
  }
  return result.data;
}

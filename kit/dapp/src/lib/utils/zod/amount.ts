/**
 * Amount Validation Utilities
 *
 * This module provides comprehensive Zod-based validation for numerical amounts
 * with configurable boundaries, decimal precision, and specialized validators
 * for different use cases (monetary, crypto, percentages, etc.).
 *
 * @module AmountValidation
 */
import { z } from "zod/v4";

/**
 * Options for the Amount schema
 */
export interface AmountOptions {
  min?: number;
  max?: number;
  decimals?: number;
  /**
   * Whether to allow zero as a valid amount
   * @default false
   */
  allowZero?: boolean;
  /**
   * Custom error messages
   */
  errorMessages?: {
    min?: string;
    max?: string;
    decimals?: string;
    type?: string;
  };
}

/**
 * Zod schema factory for validating numerical amounts with configurable constraints
 *
 * This function creates a comprehensive Zod schema for validating numerical amounts
 * with the following features:
 * - Configurable minimum and maximum value boundaries
 * - Decimal precision validation and enforcement
 * - Safe number range checking (within Number.MAX_SAFE_INTEGER)
 * - Custom error messages for better user experience
 * - NaN and Infinity protection through Zod's number validation
 * - Zero value handling with allowZero option
 * - Branded type for additional compile-time safety
 *
 * The validation process follows these steps:
 * 1. Validate input is a number (rejects NaN, Infinity)
 * 2. Check minimum value constraint
 * 3. Check maximum value constraint
 * 4. Validate decimal precision if specified
 * 5. Return as branded Amount type
 *
 * @param options - Configuration options for amount validation
 * @param options.min - Minimum allowed value (defaults based on decimals/allowZero)
 * @param options.max - Maximum allowed value (defaults to Number.MAX_SAFE_INTEGER)
 * @param options.decimals - Maximum number of decimal places allowed
 * @param options.allowZero - Whether zero is considered a valid amount (default: false)
 * @param options.errorMessages - Custom error messages for validation failures
 * @returns A branded Zod schema that validates and transforms input to Amount type
 *
 * @example
 * ```typescript
 * // Basic usage - positive numbers only
 * const basicAmount = amount();
 * basicAmount.parse(100); // 100
 * basicAmount.parse(0); // throws - zero not allowed by default
 * basicAmount.parse(-5); // throws - negative not allowed
 *
 * // With boundaries
 * const boundedAmount = amount({ min: 10, max: 1000 });
 * boundedAmount.parse(500); // 500
 * boundedAmount.parse(5); // throws - below minimum
 * boundedAmount.parse(1500); // throws - above maximum
 *
 * // With decimal precision
 * const preciseAmount = amount({ decimals: 2 });
 * preciseAmount.parse(10.99); // 10.99
 * preciseAmount.parse(10.999); // throws - too many decimals
 *
 * // Allow zero values
 * const zeroAllowedAmount = amount({ allowZero: true });
 * zeroAllowedAmount.parse(0); // 0
 *
 * // Custom error messages
 * const customAmount = amount({
 *   min: 1,
 *   max: 100,
 *   errorMessages: {
 *     min: "Amount must be at least $1",
 *     max: "Amount cannot exceed $100"
 *   }
 * });
 *
 * // Safe parsing with error handling
 * const result = basicAmount.safeParse("invalid");
 * if (result.success) {
 *   console.log(result.data); // Validated amount
 * } else {
 *   console.error(result.error.issues); // Validation errors
 * }
 * ```
 *
 * @throws {ZodError} When the input fails validation at any step
 */
export const amount = (options: AmountOptions = {}) => {
  const {
    max = Number.MAX_SAFE_INTEGER,
    min,
    decimals,
    allowZero = false,
    errorMessages = {},
  } = options;

  // Calculate minimum value
  const minimum =
    typeof min === "number"
      ? min
      : typeof decimals === "number"
        ? allowZero
          ? 0
          : 10 ** -decimals
        : allowZero
          ? 0
          : Number.EPSILON;

  let schema = z
    .number()
    .describe(`A numerical amount between ${minimum} and ${max}`);

  // Apply min/max constraints
  schema = schema
    .min(minimum, errorMessages.min || `Amount must be at least ${minimum}`)
    .max(max, errorMessages.max || `Amount must be at most ${max}`);

  // Apply decimal precision validation if specified
  if (typeof decimals === "number") {
    schema = schema.refine(
      (value) => {
        const decimalPlaces = (value.toString().split(".")[1] || "").length;
        return decimalPlaces <= decimals;
      },
      errorMessages.decimals ||
        `Amount must have at most ${decimals} decimal places`
    );
  }

  return schema.brand<"Amount">();
};

/**
 * Validates a monetary amount (2 decimal places)
 */
export const monetaryAmount = (options: Omit<AmountOptions, "decimals"> = {}) =>
  amount({ ...options, decimals: 2 });

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
    allowZero: true,
  });

/**
 * Validates a whole number amount (no decimals)
 */
export const wholeAmount = (options: Omit<AmountOptions, "decimals"> = {}) =>
  z
    .number()
    .int("Amount must be a whole number")
    .pipe(amount({ ...options, decimals: 0 }));

/**
 * Validates cryptocurrency amounts (up to 18 decimals)
 */
export const cryptoAmount = (options: Omit<AmountOptions, "decimals"> = {}) =>
  amount({ ...options, decimals: 18 });

// Register the base amount schema globally for potential use in JSON Schema generation
// and documentation tools that support Zod's global registry
z.globalRegistry.add(amount(), {
  id: "amount",
  title: "Numerical amount",
  description: "A positive numerical amount with configurable constraints",
  examples: [100, 250.5, 1000.99],
  type: "number",
  minimum: 0,
});

// Register specialized amount schemas
z.globalRegistry.add(monetaryAmount(), {
  id: "monetary_amount",
  title: "Monetary amount",
  description: "A monetary amount with 2 decimal places",
  examples: [10.99, 250.5, 1000.0],
  type: "number",
  minimum: 0,
  multipleOf: 0.01,
});

z.globalRegistry.add(percentage(), {
  id: "percentage",
  title: "Percentage",
  description:
    "A percentage value between 0 and 100 with up to 2 decimal places",
  examples: [25.5, 100, 0, 99.99],
  type: "number",
  minimum: 0,
  maximum: 100,
  multipleOf: 0.01,
});

z.globalRegistry.add(wholeAmount(), {
  id: "whole_amount",
  title: "Whole number amount",
  description: "A positive whole number amount (no decimals)",
  examples: [1, 100, 1000],
  type: "integer",
  minimum: 1,
});

z.globalRegistry.add(cryptoAmount(), {
  id: "crypto_amount",
  title: "Cryptocurrency amount",
  description: "A cryptocurrency amount with up to 18 decimal places",
  examples: [1.5, 0.000000000000000001, 1000.123456789012345678],
  type: "number",
  minimum: 0,
});

// Export types
export type Amount = z.infer<ReturnType<typeof amount>>;
export type MonetaryAmount = z.infer<ReturnType<typeof monetaryAmount>>;
export type Percentage = z.infer<ReturnType<typeof percentage>>;
export type WholeAmount = z.infer<ReturnType<typeof wholeAmount>>;
export type CryptoAmount = z.infer<ReturnType<typeof cryptoAmount>>;

// Helper functions

/**
 * Type guard function to check if a value is a valid amount
 *
 * This function provides runtime type checking for amounts,
 * useful for conditional logic and type narrowing in TypeScript.
 *
 * @param value - The value to validate (can be any type)
 * @param options - Optional configuration for amount validation
 * @returns `true` if the value is a valid amount, `false` otherwise
 *
 * @example
 * ```typescript
 * const userInput: unknown = 150.25;
 *
 * if (isAmount(userInput, { min: 0, decimals: 2 })) {
 *   // TypeScript now knows userInput is Amount
 *   console.log(`Valid amount: ${userInput}`);
 * } else {
 *   console.error("Invalid amount provided");
 * }
 * ```
 */
export function isAmount(
  value: unknown,
  options?: AmountOptions
): value is Amount {
  return amount(options).safeParse(value).success;
}

/**
 * Safely parse and validate an amount with error throwing
 *
 * This function attempts to parse and validate an amount,
 * throwing a ZodError if validation fails. Use this when you expect
 * the input to be valid and want to handle errors at a higher level.
 *
 * @param value - The value to parse and validate (can be any type)
 * @param options - Optional configuration for amount validation
 * @returns The validated amount
 * @throws {Error} When the input fails validation
 *
 * @example
 * ```typescript
 * try {
 *   const amount = getAmount(userInput, { min: 1, max: 1000 });
 *   console.log(`Valid amount: ${amount}`);
 * } catch (error) {
 *   console.error("Validation failed:", error.message);
 * }
 * ```
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

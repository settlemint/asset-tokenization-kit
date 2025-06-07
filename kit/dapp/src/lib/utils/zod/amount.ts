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
  allowZero?: boolean;
}

/**
 * Validates a positive amount with specific boundaries
 *
 * @param options - Configuration options for amount validation
 * @param options.min - Minimum allowed value (defaults based on decimals or 0)
 * @param options.max - Maximum allowed value (defaults to Number.MAX_SAFE_INTEGER)
 * @param options.decimals - Used to calculate minimum if min not provided
 * @param options.allowZero - Whether to allow zero values (default: false)
 * @returns A Zod schema that validates positive amounts with specific boundaries
 */
export const amount = ({
  max = Number.MAX_SAFE_INTEGER,
  min,
  decimals,
  allowZero = false,
}: AmountOptions = {}) => {
  const minimum =
    typeof min === "number"
      ? min
      : typeof decimals === "number"
        ? 10 ** -decimals
        : allowZero
          ? 0
          : Number.EPSILON;

  // Build the schema with all validations in one chain
  const baseSchema = z
    .number()
    .min(minimum, `Amount must be at least ${minimum}`)
    .max(max, `Amount must be at most ${max}`);

  // Add decimal validation if decimals is specified
  if (typeof decimals === "number") {
    return baseSchema
      .refine(
        (value) => {
          const decimalPart = value.toString().split(".")[1];
          return !decimalPart || decimalPart.length <= decimals;
        },
        {
          message: `Amount must have at most ${decimals} decimal places`,
        }
      )
      .describe(`A positive numerical amount between ${minimum} and ${max}`);
  }

  return baseSchema.describe(
    `A positive numerical amount between ${minimum} and ${max}`
  );
};

// Export types
export type Amount = z.infer<ReturnType<typeof amount>>;

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
  // Special case for zero when using default options
  if (
    value === 0 &&
    (!options || (options.allowZero === undefined && options.min === undefined))
  ) {
    return amount({ allowZero: true }).parse(value);
  }
  const result = amount(options).safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid amount: ${value}`);
  }
  return result.data;
}

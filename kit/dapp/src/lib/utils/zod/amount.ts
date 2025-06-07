/**
 * Amount Validation Utilities
 *
 * This module provides Zod-based validation for numerical amounts
 * with configurable boundaries, matching the TypeBox amount validator.
 * It's commonly used for validating monetary values, token amounts,
 * and other numerical quantities in financial applications.
 *
 * @module AmountValidation
 */
import { z } from "zod";

/**
 * Configuration options for amount validation.
 * 
 * @interface AmountOptions
 * @property {number} [min] - Minimum allowed value (defaults based on decimals or 0)
 * @property {number} [max] - Maximum allowed value (defaults to Number.MAX_SAFE_INTEGER)
 * @property {number} [decimals] - Maximum number of decimal places allowed
 * @property {boolean} [allowZero] - Whether to allow zero values (default: false)
 */
export interface AmountOptions {
  min?: number;
  max?: number;
  decimals?: number;
  allowZero?: boolean;
}

/**
 * Creates a Zod schema that validates positive numerical amounts with specific boundaries.
 *
 * @param options - Configuration options for amount validation
 * @param options.min - Minimum allowed value (defaults based on decimals or 0)
 * @param options.max - Maximum allowed value (defaults to Number.MAX_SAFE_INTEGER)
 * @param options.decimals - Used to calculate minimum if min not provided and limits decimal places
 * @param options.allowZero - Whether to allow zero values (default: false)
 * @returns A Zod schema that validates positive amounts with specific boundaries
 * 
 * @example
 * ```typescript
 * // Basic amount validation (no zero allowed)
 * const schema = amount();
 * schema.parse(100); // Valid
 * schema.parse(0); // Invalid
 * 
 * // Amount with 2 decimal places (e.g., for USD)
 * const usdAmount = amount({ decimals: 2 });
 * usdAmount.parse(99.99); // Valid
 * usdAmount.parse(99.999); // Invalid - too many decimals
 * 
 * // Amount that allows zero
 * const withdrawAmount = amount({ allowZero: true });
 * withdrawAmount.parse(0); // Valid
 * ```
 */
export const amount = ({
  max = Number.MAX_SAFE_INTEGER,
  min,
  decimals,
  allowZero = false,
}: AmountOptions = {}) => {
  // Calculate the minimum value based on provided options
  // Priority: explicit min > decimals-based min > allowZero check > epsilon
  const minimum =
    typeof min === "number"
      ? min
      : typeof decimals === "number"
        ? 10 ** -decimals // e.g., 0.01 for 2 decimals
        : allowZero
          ? 0
          : Number.EPSILON; // Smallest positive number

  // Build the base schema with min/max validation
  const baseSchema = z
    .number()
    .min(minimum, `Amount must be at least ${minimum}`)
    .max(max, `Amount must be at most ${max}`);

  // Add decimal place validation if decimals is specified
  if (typeof decimals === "number") {
    return baseSchema
      .refine(
        (value) => {
          // Check the number of decimal places
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

/**
 * Type representing a validated amount value.
 * Inferred from the amount schema based on the provided options.
 */
export type Amount = z.infer<ReturnType<typeof amount>>;

// Helper functions

/**
 * Type guard function to check if a value is a valid amount.
 * 
 * @param value - The value to check
 * @param options - Optional configuration for amount validation
 * @returns `true` if the value is a valid amount according to the options, `false` otherwise
 * 
 * @example
 * ```typescript
 * if (isAmount(100.50, { decimals: 2 })) {
 *   // TypeScript knows this is a valid Amount
 *   console.log("Valid monetary amount");
 * }
 * 
 * // Check without options
 * isAmount(0); // false (zero not allowed by default)
 * isAmount(0, { allowZero: true }); // true
 * ```
 */
export function isAmount(
  value: unknown,
  options?: AmountOptions
): value is Amount {
  // Use safeParse to validate without throwing errors
  return amount(options).safeParse(value).success;
}

/**
 * Safely parse and validate an amount with error throwing.
 * Handles the special case where zero is provided without explicit options.
 * 
 * @param value - The value to parse as an amount
 * @param options - Optional configuration for amount validation
 * @returns The validated amount value
 * @throws {Error} If the value is not a valid amount according to the options
 * 
 * @example
 * ```typescript
 * try {
 *   const validAmount = getAmount(99.99, { decimals: 2 }); // Returns 99.99
 *   const zeroAmount = getAmount(0); // Automatically allows zero
 *   const invalid = getAmount(-10); // Throws Error
 * } catch (error) {
 *   console.error("Invalid amount provided");
 * }
 * ```
 */
export function getAmount(value: unknown, options?: AmountOptions): Amount {
  // Special case: when zero is provided without explicit options,
  // automatically allow it (common use case for initial values)
  if (
    value === 0 &&
    (!options || (options.allowZero === undefined && options.min === undefined))
  ) {
    return amount({ allowZero: true }).parse(value);
  }
  
  // Attempt to parse the value with the provided options
  const result = amount(options).safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid amount: ${value}`);
  }
  return result.data;
}

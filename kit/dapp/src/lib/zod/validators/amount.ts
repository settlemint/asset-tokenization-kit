/**
 * Amount Validation Utilities
 *
 * This module provides Zod-based validation for numerical amounts
 * with configurable boundaries, matching the TypeBox amount validator.
 * It's commonly used for validating monetary values, token amounts,
 * and other numerical quantities in financial applications.
 * @module AmountValidation
 */
import { z } from "zod";

/**
 * Configuration options for amount validation.
 * @interface AmountOptions
 * @property {number} [min] - Minimum allowed value (defaults based on decimals or 0)
 * @property {number} [max] - Maximum allowed value (defaults to Number.MAX_SAFE_INTEGER)
 * @property {number} [decimals] - Used to calculate minimum if min not provided
 */
export interface AmountOptions {
  min?: number;
  max?: number;
  decimals?: number;
}

/**
 * Creates a Zod schema that validates positive numerical amounts with specific boundaries.
 *
 * This schema accepts both string and number inputs to ensure precision:
 * - String inputs avoid JavaScript number precision limits
 * - Number inputs are supported for convenience
 * - Already-parsed numbers are passed through efficiently
 *
 * @param options - Configuration options for amount validation
 * @param options.min - Minimum allowed value (defaults based on decimals or 0)
 * @param options.max - Maximum allowed value (defaults to Number.MAX_SAFE_INTEGER)
 * @param options.decimals - Used to calculate minimum if min not provided
 * @returns A Zod schema that validates positive amounts with specific boundaries
 * @example
 * ```typescript
 * // Basic amount validation (allows zero by default)
 * const schema = amount();
 * schema.parse(100); // Valid
 * schema.parse("100"); // Valid (string input)
 * schema.parse(0); // Valid
 *
 * // Amount with 2 decimal places minimum
 * const usdAmount = amount({ decimals: 2 });
 * usdAmount.parse(0.01); // Valid (minimum is 0.01)
 * usdAmount.parse("0.01"); // Valid (string input)
 * usdAmount.parse(0.009); // Invalid - below minimum
 *
 * // Amount with explicit minimum
 * const minAmount = amount({ min: 10 });
 * minAmount.parse(10); // Valid
 * minAmount.parse("10"); // Valid (string input)
 * minAmount.parse(5); // Invalid
 * ```
 */
export const amount = ({
  max = Number.MAX_SAFE_INTEGER,
  min,
  decimals,
}: AmountOptions = {}) => {
  // Calculate the minimum value based on provided options
  // Priority: explicit min > decimals-based min > 0
  const minimum =
    typeof min === "number"
      ? min
      : typeof decimals === "number"
        ? 10 ** -decimals // e.g., 0.01 for 2 decimals
        : 0;

  return z
    .union([z.string(), z.number()])
    .transform((value, ctx) => {
      // If already a number, validate it directly
      if (typeof value === "number") {
        return value;
      }

      // Parse string to number
      const parsed = Number.parseFloat(value);
      if (Number.isNaN(parsed)) {
        ctx.addIssue({
          code: "custom",
          message:
            "Invalid amount format. Please provide a valid numeric string",
        });
        return z.NEVER;
      }
      return parsed;
    })
    .refine((value) => value >= minimum, {
      message: `Amount must be at least ${String(minimum)}`,
    })
    .refine((value) => value <= max, {
      message: `Amount must not exceed ${String(max)}`,
    })
    .describe(
      `A positive numerical amount between ${String(minimum)} and ${String(max)}`
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
 * @param value - The value to check
 * @param options - Optional configuration for amount validation
 * @returns `true` if the value is a valid amount according to the options, `false` otherwise
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
 * @param value - The value to parse as an amount
 * @param options - Optional configuration for amount validation
 * @returns The validated amount value
 * @throws {Error} If the value is not a valid amount according to the options
 * @example
 * ```typescript
 * try {
 *   const validAmount = getAmount(99.99, { decimals: 2 }); // Returns 99.99
 *   const stringAmount = getAmount("99.99", { decimals: 2 }); // Returns 99.99
 *   const zeroAmount = getAmount(0, { allowZero: true }); // Explicitly allow zero
 *   const invalid = getAmount(-10); // Throws Error
 * } catch (error) {
 *   console.error("Invalid amount provided");
 * }
 * ```
 */
export function getAmount(value: unknown, options?: AmountOptions): Amount {
  return amount(options).parse(value);
}

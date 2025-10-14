/**
 * Decimals Validation Utilities
 *
 * This module provides Zod schemas for validating decimal precision values,
 * commonly used in blockchain and financial applications to specify the number
 * of decimal places for token amounts and monetary values.
 * @module DecimalsValidation
 */
import * as z from "zod";

/**
 * Creates a Zod schema that validates decimal precision values.
 *
 * This schema accepts both string and number inputs:
 * - String inputs for API compatibility and consistent parsing
 * - Number inputs for convenience
 * - Already-parsed numbers are passed through efficiently
 *
 * @remarks
 * - Must be an integer (no fractional values)
 * - Range: 0 to 18 (standard ERC20 token maximum)
 * - 0 decimals = whole units only (e.g., no cents)
 * - 18 decimals = maximum precision (Ethereum standard)
 * - Common values: 2 (fiat currencies), 6 (USDC), 18 (ETH)
 * @returns A Zod schema for decimal validation
 * @example
 * ```typescript
 * const schema = decimals();
 *
 * // Valid decimals
 * schema.parse(0);    // No decimals (whole units)
 * schema.parse("2");  // Fiat currency standard (string input)
 * schema.parse(6);    // USDC standard
 * schema.parse("18"); // Ethereum standard (string input)
 *
 * // Invalid decimals
 * schema.parse(-1);   // Throws - negative
 * schema.parse("2.5");  // Throws - not integer
 * schema.parse(19);   // Throws - exceeds maximum
 * ```
 */
export const decimals = () =>
  z
    .union([z.string(), z.number()])
    .transform((value, ctx) => {
      // If already a number, return it for further validation
      if (typeof value === "number") {
        return value;
      }

      // Parse string to number
      const parsed = Number.parseInt(value, 10);
      if (Number.isNaN(parsed) || value.includes(".") || value.includes("e")) {
        ctx.addIssue({
          code: "custom",
          message: "Decimals must be a whole number (integer)",
        });
        return z.NEVER;
      }
      return parsed;
    })
    .refine((value) => Number.isInteger(value), {
      message: "Decimals must be a whole number (integer)",
    })
    .refine((value) => value >= 0, {
      message: "Decimals cannot be negative",
    })
    .refine((value) => value <= 18, {
      message: "Decimals cannot exceed 18 (ERC20 standard maximum)",
    })
    .describe("Number of decimal places for the asset");

/**
 * Type representing validated decimal precision.
 * Ensures type safety.
 */
export type Decimals = z.infer<ReturnType<typeof decimals>>;

/**
 * Type guard to check if a value is valid decimals.
 * @param value - The value to check
 * @returns `true` if the value is a valid decimal precision, `false` otherwise
 * @example
 * ```typescript
 * const userInput: unknown = 6;
 * if (isDecimals(userInput)) {
 *   // TypeScript knows userInput is Decimals
 *   console.log(`Valid decimals: ${userInput}`);
 * }
 *
 * // Common usage in conditional logic
 * if (isDecimals(tokenDecimals)) {
 *   const divisor = 10 ** tokenDecimals;
 *   // Perform calculations with confidence
 * }
 * ```
 */
export function isDecimals(value: unknown): value is Decimals {
  return decimals().safeParse(value).success;
}

/**
 * Safely parse and return decimals or throw an error.
 * @param value - The value to parse as decimals
 * @returns The validated decimal precision
 * @throws {Error} If the value is not valid decimals
 * @example
 * ```typescript
 * try {
 *   const tokenDecimals = getDecimals(18); // Returns 18 as Decimals
 *   const stringDecimals = getDecimals("6"); // Returns 6 as Decimals
 *   const invalidDecimals = getDecimals(20); // Throws Error
 * } catch (error) {
 *   console.error("Invalid decimal precision");
 * }
 *
 * // Use in token calculations
 * const decimals = getDecimals(assetConfig.decimals);
 * const atomicUnits = displayAmount * (10 ** decimals);
 * ```
 */
export function getDecimals(value: unknown): Decimals {
  return decimals().parse(value);
}

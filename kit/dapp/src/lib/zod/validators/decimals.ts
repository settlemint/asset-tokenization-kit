/**
 * Decimals Validation Utilities
 *
 * This module provides Zod schemas for validating decimal precision values,
 * commonly used in blockchain and financial applications to specify the number
 * of decimal places for token amounts and monetary values.
 *
 * @module DecimalsValidation
 */
import { z } from 'zod/v4';

/**
 * Creates a Zod schema that validates decimal precision values.
 *
 * @remarks
 * - Must be an integer (no fractional values)
 * - Range: 0 to 18 (standard ERC20 token maximum)
 * - 0 decimals = whole units only (e.g., no cents)
 * - 18 decimals = maximum precision (Ethereum standard)
 * - Common values: 2 (fiat currencies), 6 (USDC), 18 (ETH)
 *
 * @returns A Zod schema for decimal validation
 *
 * @example
 * ```typescript
 * const schema = decimals();
 *
 * // Valid decimals
 * schema.parse(0);  // No decimals (whole units)
 * schema.parse(2);  // Fiat currency standard (e.g., USD)
 * schema.parse(6);  // USDC standard
 * schema.parse(18); // Ethereum standard
 *
 * // Invalid decimals
 * schema.parse(-1);   // Throws - negative
 * schema.parse(2.5);  // Throws - not integer
 * schema.parse(19);   // Throws - exceeds maximum
 * ```
 */
export const decimals = () =>
  z
    .number()
    .int('Decimals must be a whole number (integer)')
    .min(0, 'Decimals cannot be negative')
    .max(18, 'Decimals cannot exceed 18 (ERC20 standard maximum)') // Standard ERC20 maximum
    .describe('Number of decimal places for the asset');

/**
 * Type representing validated decimal precision.
 * Ensures type safety.
 */
export type Decimals = z.infer<ReturnType<typeof decimals>>;

/**
 * Type guard to check if a value is valid decimals.
 *
 * @param value - The value to check
 * @returns `true` if the value is a valid decimal precision, `false` otherwise
 *
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
 *
 * @param value - The value to parse as decimals
 * @returns The validated decimal precision
 * @throws {Error} If the value is not valid decimals
 *
 * @example
 * ```typescript
 * try {
 *   const tokenDecimals = getDecimals(18); // Returns 18 as Decimals
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

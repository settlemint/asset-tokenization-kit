/**
 * BigDecimal Validation Utilities
 *
 * This module provides comprehensive Zod-based validation for arbitrary precision
 * decimal numbers using the dnum library, ensuring accurate representation and
 * manipulation of large or highly precise numerical values.
 *
 * @module BigDecimalValidation
 */
import { from } from 'dnum';
import { z } from 'zod/v4';

/**
 * Zod schema for validating and transforming arbitrary precision decimal numbers
 *
 * This schema provides comprehensive validation for big decimal numbers with the following features:
 * - String-based input to preserve precision and avoid JavaScript number limitations
 * - Validation against special values (NaN, Infinity, -Infinity)
 * - Support for scientific notation (e.g., "1.23e10")
 * - Automatic transformation to dnum's Dnum type for precise calculations
 * - Integration with dnum library for arbitrary precision arithmetic
 *
 * The validation process follows these steps:
 * 1. Check input is a string (required for precision preservation)
 * 2. Reject special string values (NaN, Infinity, -Infinity)
 * 3. Validate numeric format using dnum's from() function
 * 4. Transform to Dnum type for precise arithmetic operations
 *
 * Supported formats:
 * - Standard decimal: "123.456"
 * - Scientific notation: "1.23e10", "1.23E-5"
 * - Integer strings: "123"
 * - Negative numbers: "-123.456"
 * - Very large numbers: "999999999999999999999999999999.99"
 * - Very small numbers: "0.000000000000000001"
 *
 * @example
 * ```typescript
 * // Valid decimal parsing
 * const decimal = bigDecimal().parse("123.456789012345678901234567890");
 * // Returns: Dnum representing the exact decimal value
 * // Type: Dnum
 *
 * // Scientific notation support
 * const scientific = bigDecimal().parse("1.23e10");
 * // Returns: Dnum representing 12300000000
 *
 * // High precision calculations
 * const precise = bigDecimal().parse("0.000000000000000001");
 * // Returns: Dnum with exact precision preserved
 *
 * // Safe parsing with error handling
 * const result = bigDecimal().safeParse("invalid-number");
 * if (result.success) {
 *   console.log(result.data); // Dnum value
 * } else {
 *   console.error(result.error.issues); // Validation errors
 * }
 *
 * // Large number handling (beyond JavaScript number precision)
 * const large = bigDecimal().parse("999999999999999999999999999999.99");
 * // Works correctly without precision loss
 * ```
 *
 * @throws {ZodError} When the input fails validation at any step
 */
export const bigDecimal = () =>
  z
    .string()
    .describe('A decimal number with arbitrary precision')
    .transform((value, ctx) => {
      // Reject special values
      const upper = value.toUpperCase();
      if (upper === 'NAN' || upper === 'INFINITY' || upper === '-INFINITY') {
        ctx.addIssue({
          code: 'custom',
          message:
            'Invalid value. NaN, Infinity, and -Infinity are not allowed',
        });
        return z.NEVER;
      }
      try {
        // dnum accepts string or number
        return from(value);
      } catch {
        ctx.addIssue({
          code: 'custom',
          message:
            'Invalid decimal format. Please provide a valid numeric string',
        });
        return z.NEVER;
      }
    });

/**
 * Type representing a validated arbitrary precision decimal number
 *
 * This type represents dnum's Dnum type, ensuring that only validated
 * big decimals can be assigned to variables of this type.
 */
export type BigDecimal = z.infer<ReturnType<typeof bigDecimal>>;

/**
 * Type guard function to check if a value is a valid big decimal
 *
 * This function provides runtime type checking for big decimal values,
 * useful for conditional logic and type narrowing in TypeScript.
 *
 * @param value - The value to validate (can be any type)
 * @returns `true` if the value is a valid big decimal, `false` otherwise
 *
 * @example
 * ```typescript
 * const userInput: unknown = "123.456789012345678901234567890";
 *
 * if (isBigDecimal(userInput)) {
 *   // TypeScript now knows userInput is BigDecimal (Dnum)
 *   console.log(`Valid big decimal: ${userInput}`);
 * } else {
 *   console.error("Invalid big decimal provided");
 * }
 * ```
 */
export function isBigDecimal(value: unknown): value is BigDecimal {
  return bigDecimal().safeParse(value).success;
}

/**
 * Safely parse and validate a big decimal with error throwing
 *
 * This function attempts to parse and validate a big decimal value,
 * throwing a ZodError if validation fails. Use this when you expect
 * the input to be valid and want to handle errors at a higher level.
 *
 * @param value - The value to parse and validate (can be any type)
 * @returns The validated big decimal as Dnum type
 * @throws {Error} When the input fails validation
 *
 * @example
 * ```typescript
 * try {
 *   const decimal = getBigDecimal("123.456789012345678901234567890");
 *   console.log(`Valid big decimal: ${decimal}`);
 *   // Can now use dnum operations on the result
 * } catch (error) {
 *   console.error("Validation failed:", error.message);
 * }
 * ```
 */
export function getBigDecimal(value: unknown): BigDecimal {
  return bigDecimal().parse(value);
}

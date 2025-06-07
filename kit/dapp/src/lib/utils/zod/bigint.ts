/**
 * BigInt Validation Utilities
 *
 * This module provides comprehensive Zod schemas for validating and transforming BigInt values
 * from string representations. It's designed to handle large integers that exceed JavaScript's
 * safe integer range, commonly used in blockchain applications for token amounts, timestamps,
 * and other large numeric values.
 * 
 * @module BigIntValidation
 */
import { z } from "zod";

/**
 * Validates and transforms a string representation of a large number to BigInt.
 *
 * This validator ensures the input is a valid string that can be converted to BigInt.
 * If the string contains decimals, it truncates to the integer part.
 * 
 * @remarks
 * - Rejects empty strings
 * - Rejects scientific notation (e.g., "1e10")
 * - Handles decimal strings by truncating fractional parts
 * - Validates format before attempting conversion
 *
 * @returns A Zod schema that validates and transforms string to BigInt
 * 
 * @example
 * ```typescript
 * const schema = stringifiedBigInt();
 * 
 * // Valid conversions
 * schema.parse("123456789012345678901234567890"); // 123456789012345678901234567890n
 * schema.parse("-999999999999999999999"); // -999999999999999999999n
 * schema.parse("123.456"); // 123n (truncates decimals)
 * 
 * // Invalid inputs
 * schema.parse(""); // Throws - empty string
 * schema.parse("1e10"); // Throws - scientific notation
 * schema.parse("abc"); // Throws - non-numeric
 * ```
 */
export const stringifiedBigInt = () =>
  z
    .string()
    .describe("A string representation of a large number")
    .transform((value, ctx) => {
      try {
        // Check for empty string
        if (value.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "BigInt string cannot be empty",
          });
          return z.NEVER;
        }

        // Check for scientific notation - not supported for BigInt
        if (value.toLowerCase().includes("e")) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Scientific notation is not supported",
          });
          return z.NEVER;
        }

        // Check for multiple decimal points - invalid format
        const decimalCount = (value.match(/\./g) || []).length;
        if (decimalCount > 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid numeric format: multiple decimal points",
          });
          return z.NEVER;
        }

        // Handle decimal strings by truncating to integer part
        // This is common when converting from user input or APIs
        if (value.includes(".")) {
          value = value.split(".")[0];
        }
        
        // Attempt to convert to BigInt
        return BigInt(value);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Must be a valid numeric string",
        });
        return z.NEVER;
      }
    });

/**
 * Alternative validator that accepts both string and bigint inputs.
 * Useful when the source might already provide bigint values.
 * 
 * @returns A Zod union schema accepting string or native bigint
 * 
 * @example
 * ```typescript
 * const schema = bigIntInput();
 * schema.parse("123456789"); // 123456789n
 * schema.parse(123456789n); // 123456789n
 * ```
 */
export const bigIntInput = () =>
  z
    .union([stringifiedBigInt(), z.bigint().brand<"StringifiedBigInt">()])
    .describe("A BigInt value (string or native)");

/**
 * Validator for positive BigInt values only.
 * Ensures the value is greater than zero.
 * 
 * @returns A Zod schema that validates positive BigInt values
 * 
 * @example
 * ```typescript
 * const schema = positiveBigInt();
 * schema.parse("100"); // 100n
 * schema.parse("0"); // Throws - not positive
 * schema.parse("-10"); // Throws - negative
 * ```
 */
export const positiveBigInt = () =>
  stringifiedBigInt().refine((value) => value > 0n, {
    message: `BigInt must be positive`,
  });

/**
 * Validator for non-negative BigInt values (includes 0).
 * Ensures the value is zero or greater.
 * 
 * @returns A Zod schema that validates non-negative BigInt values
 * 
 * @example
 * ```typescript
 * const schema = nonNegativeBigInt();
 * schema.parse("100"); // 100n
 * schema.parse("0"); // 0n
 * schema.parse("-10"); // Throws - negative
 * ```
 */
export const nonNegativeBigInt = () =>
  stringifiedBigInt().refine((value) => value >= 0n, {
    message: `BigInt must be non-negative`,
  });

// Note: Global registry functionality removed as it's not available in Zod v4

// Export types
/**
 * Type representing a validated BigInt converted from string.
 */
export type StringifiedBigInt = z.infer<ReturnType<typeof stringifiedBigInt>>;

/**
 * Type representing a BigInt from either string or native bigint input.
 */
export type BigIntInput = z.infer<ReturnType<typeof bigIntInput>>;

/**
 * Type representing a positive BigInt value.
 */
export type PositiveBigInt = z.infer<ReturnType<typeof positiveBigInt>>;

/**
 * Type representing a non-negative BigInt value.
 */
export type NonNegativeBigInt = z.infer<ReturnType<typeof nonNegativeBigInt>>;

/**
 * Type guard to check if a value is a valid stringified bigint.
 * 
 * @param value - The value to check
 * @returns `true` if the value can be parsed as a BigInt, `false` otherwise
 * 
 * @example
 * ```typescript
 * if (isStringifiedBigInt("123456789")) {
 *   console.log("Valid BigInt string");
 * }
 * ```
 */
export function isStringifiedBigInt(
  value: unknown
): value is StringifiedBigInt {
  return stringifiedBigInt().safeParse(value).success;
}

/**
 * Safely parse and return a stringified bigint or throw an error.
 * 
 * @param value - The value to parse
 * @returns The parsed BigInt value
 * @throws {Error} If the value cannot be parsed as a BigInt
 * 
 * @example
 * ```typescript
 * const bigint = getStringifiedBigInt("123456789"); // 123456789n
 * const invalid = getStringifiedBigInt("abc"); // Throws Error
 * ```
 */
export function getStringifiedBigInt(value: unknown): StringifiedBigInt {
  const result = stringifiedBigInt().safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid stringified bigint: ${value}`);
  }
  return result.data;
}

/**
 * Type guard to check if a value is a valid bigint input.
 * 
 * @param value - The value to check
 * @returns `true` if the value is a valid bigint input (string or native), `false` otherwise
 * 
 * @example
 * ```typescript
 * if (isBigIntInput("123456789")) {
 *   console.log("Valid BigInt input");
 * }
 * if (isBigIntInput(123456789n)) {
 *   console.log("Valid native BigInt");
 * }
 * ```
 */
export function isBigIntInput(value: unknown): value is BigIntInput {
  try {
    return bigIntInput().safeParse(value).success;
  } catch {
    // Catch any unexpected errors during parsing
    return false;
  }
}

/**
 * Safely parse and return a bigint input or throw an error.
 * 
 * @param value - The value to parse (string or native bigint)
 * @returns The parsed BigInt value
 * @throws {Error} If the value is not a valid bigint input
 * 
 * @example
 * ```typescript
 * const bigint1 = getBigIntInput("123456789"); // 123456789n
 * const bigint2 = getBigIntInput(123456789n); // 123456789n
 * ```
 */
export function getBigIntInput(value: unknown): BigIntInput {
  const result = bigIntInput().safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid bigint input: ${value}`);
  }
  return result.data;
}

/**
 * Type guard to check if a value is a valid positive bigint.
 * 
 * @param value - The value to check
 * @returns `true` if the value is a positive bigint, `false` otherwise
 * 
 * @example
 * ```typescript
 * if (isPositiveBigInt("100")) {
 *   console.log("Positive BigInt");
 * }
 * isPositiveBigInt("0"); // false
 * isPositiveBigInt("-10"); // false
 * ```
 */
export function isPositiveBigInt(value: unknown): value is PositiveBigInt {
  try {
    return positiveBigInt().safeParse(value).success;
  } catch {
    // Catch any unexpected errors during parsing
    return false;
  }
}

/**
 * Safely parse and return a positive bigint or throw an error.
 * 
 * @param value - The value to parse
 * @returns The parsed positive BigInt value
 * @throws {Error} If the value is not a positive bigint
 * 
 * @example
 * ```typescript
 * const bigint = getPositiveBigInt("100"); // 100n
 * const zero = getPositiveBigInt("0"); // Throws Error
 * ```
 */
export function getPositiveBigInt(value: unknown): PositiveBigInt {
  const result = positiveBigInt().safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid positive bigint: ${value}`);
  }
  return result.data;
}

/**
 * Type guard to check if a value is a valid non-negative bigint.
 * 
 * @param value - The value to check
 * @returns `true` if the value is a non-negative bigint, `false` otherwise
 * 
 * @example
 * ```typescript
 * if (isNonNegativeBigInt("100")) {
 *   console.log("Non-negative BigInt");
 * }
 * isNonNegativeBigInt("0"); // true
 * isNonNegativeBigInt("-10"); // false
 * ```
 */
export function isNonNegativeBigInt(
  value: unknown
): value is NonNegativeBigInt {
  try {
    return nonNegativeBigInt().safeParse(value).success;
  } catch {
    // Catch any unexpected errors during parsing
    return false;
  }
}

/**
 * Safely parse and return a non-negative bigint or throw an error.
 * 
 * @param value - The value to parse
 * @returns The parsed non-negative BigInt value
 * @throws {Error} If the value is not a non-negative bigint
 * 
 * @example
 * ```typescript
 * const bigint = getNonNegativeBigInt("100"); // 100n
 * const zero = getNonNegativeBigInt("0"); // 0n
 * const negative = getNonNegativeBigInt("-10"); // Throws Error
 * ```
 */
export function getNonNegativeBigInt(value: unknown): NonNegativeBigInt {
  const result = nonNegativeBigInt().safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid non-negative bigint: ${value}`);
  }
  return result.data;
}

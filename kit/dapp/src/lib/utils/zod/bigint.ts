/**
 * Zod validator for BigInt
 *
 * This module provides a Zod schema for validating and transforming BigInt values
 * from string representations.
 */
import { z } from "zod";

/**
 * Validates and transforms a string representation of a large number to BigInt
 *
 * This validator ensures the input is a valid string that can be converted to BigInt.
 * If the string contains decimals, it truncates to the integer part.
 *
 * @returns A Zod schema that validates and transforms string to BigInt
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

        // Check for scientific notation
        if (value.toLowerCase().includes("e")) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Scientific notation is not supported",
          });
          return z.NEVER;
        }

        // Check for multiple decimal points
        const decimalCount = (value.match(/\./g) || []).length;
        if (decimalCount > 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid numeric format: multiple decimal points",
          });
          return z.NEVER;
        }

        // Handle decimal strings by parsing them as integers
        if (value.includes(".")) {
          value = value.split(".")[0];
        }
        
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
 * Alternative validator that accepts both string and bigint inputs
 * Useful when the source might already provide bigint values
 */
export const bigIntInput = () =>
  z
    .union([stringifiedBigInt(), z.bigint().brand<"StringifiedBigInt">()])
    .describe("A BigInt value (string or native)");

/**
 * Validator for positive BigInt values only
 */
export const positiveBigInt = () =>
  stringifiedBigInt().refine((value) => value > 0n, {
    message: `BigInt must be positive`,
  });

/**
 * Validator for non-negative BigInt values (includes 0)
 */
export const nonNegativeBigInt = () =>
  stringifiedBigInt().refine((value) => value >= 0n, {
    message: `BigInt must be non-negative`,
  });

// Note: Global registry functionality removed as it's not available in Zod v4

// Export types
export type StringifiedBigInt = z.infer<ReturnType<typeof stringifiedBigInt>>;
export type BigIntInput = z.infer<ReturnType<typeof bigIntInput>>;
export type PositiveBigInt = z.infer<ReturnType<typeof positiveBigInt>>;
export type NonNegativeBigInt = z.infer<ReturnType<typeof nonNegativeBigInt>>;

/**
 * Type guard to check if a value is a valid stringified bigint
 */
export function isStringifiedBigInt(
  value: unknown
): value is StringifiedBigInt {
  return stringifiedBigInt().safeParse(value).success;
}

/**
 * Safely parse and return a stringified bigint or throw an error
 */
export function getStringifiedBigInt(value: unknown): StringifiedBigInt {
  const result = stringifiedBigInt().safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid stringified bigint: ${value}`);
  }
  return result.data;
}

/**
 * Type guard to check if a value is a valid bigint input
 * @param value - The value to check
 * @returns true if the value is a valid bigint input
 */
export function isBigIntInput(value: unknown): value is BigIntInput {
  try {
    return bigIntInput().safeParse(value).success;
  } catch {
    return false;
  }
}

/**
 * Safely parse and return a bigint input or throw an error
 * @param value - The value to parse
 * @returns The bigint input if valid, throws when not
 */
export function getBigIntInput(value: unknown): BigIntInput {
  const result = bigIntInput().safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid bigint input: ${value}`);
  }
  return result.data;
}

/**
 * Type guard to check if a value is a valid positive bigint
 * @param value - The value to check
 * @returns true if the value is a valid positive bigint
 */
export function isPositiveBigInt(value: unknown): value is PositiveBigInt {
  try {
    return positiveBigInt().safeParse(value).success;
  } catch {
    return false;
  }
}

/**
 * Safely parse and return a positive bigint or throw an error
 * @param value - The value to parse
 * @returns The positive bigint if valid, throws when not
 */
export function getPositiveBigInt(value: unknown): PositiveBigInt {
  const result = positiveBigInt().safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid positive bigint: ${value}`);
  }
  return result.data;
}

/**
 * Type guard to check if a value is a valid non-negative bigint
 * @param value - The value to check
 * @returns true if the value is a valid non-negative bigint
 */
export function isNonNegativeBigInt(
  value: unknown
): value is NonNegativeBigInt {
  try {
    return nonNegativeBigInt().safeParse(value).success;
  } catch {
    return false;
  }
}

/**
 * Safely parse and return a non-negative bigint or throw an error
 * @param value - The value to parse
 * @returns The non-negative bigint if valid, throws when not
 */
export function getNonNegativeBigInt(value: unknown): NonNegativeBigInt {
  const result = nonNegativeBigInt().safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid non-negative bigint: ${value}`);
  }
  return result.data;
}

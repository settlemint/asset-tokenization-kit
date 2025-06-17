/**
 * BigInt Validation Utilities
 *
 * Provides Zod schemas for validating and transforming BigInt values from various input types.
 * Designed for blockchain applications handling large numeric values like token amounts.
 *
 * @module BigIntValidation
 */
import { abs, floor, from, multiply, toString, type Numberish } from "dnum";
import { z } from "zod";

/**
 * Flexible BigInt validator that accepts strings, numbers, or bigints.
 * Uses dnum for precise decimal handling and scientific notation support.
 * Automatically truncates decimal values when converting to BigInt.
 *
 * @example
 * ```typescript
 * apiBigInt.parse("123456789012345678901234567890"); // 123456789012345678901234567890n
 * apiBigInt.parse(123); // 123n
 * apiBigInt.parse(123n); // 123n
 * apiBigInt.parse("123.456"); // 123n (truncates decimals)
 * apiBigInt.parse("1e10"); // 10000000000n
 * apiBigInt.parse("1.23e4"); // 12300n
 * apiBigInt.parse("1e30"); // 1000000000000000000000000000000n
 * ```
 */
export const apiBigInt = z.preprocess((value, ctx) => {
  // If already a bigint, return as is
  if (typeof value === "bigint") {
    return value;
  }

  // Handle string preprocessing
  if (typeof value === "string") {
    // Reject multiple decimal points
    if (value.includes(".") && value.split(".").length > 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid BigInt format: multiple decimal points",
      });
      return z.NEVER;
    }
  }

  // dnum accepts string, number, bigint, or [bigint, number] (Dnum type)
  // Check if the value is one of these types
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    (Array.isArray(value) &&
      value.length === 2 &&
      typeof value[0] === "bigint" &&
      typeof value[1] === "number")
  ) {
    try {
      // Convert to dnum (handles strings, numbers, scientific notation)
      // We've validated the type above, so we can safely cast
      const dnum = from(value as Numberish);

      // Truncate towards zero (not floor which rounds down)
      // For positive numbers, floor works fine
      // For negative numbers, we need to use ceiling (which is -floor(abs))
      const isNegative = dnum[0] < 0n;
      let truncated;

      if (isNegative) {
        // For negative numbers, we want to truncate towards zero
        // So we take the absolute value, floor it, then negate
        const absValue = abs(dnum);
        const floored = floor(absValue);
        // Negate by multiplying by -1
        truncated = multiply(floored, from(-1));
      } else {
        // For positive numbers, floor is what we want
        truncated = floor(dnum);
      }

      // Convert to string without decimals
      const integerString = toString(truncated, 0);

      // Return the integer string for z.coerce.bigint() to process
      return integerString;
    } catch {
      // If dnum can't parse it, pass through the original value
      // and let z.coerce.bigint() handle or reject it
      return value;
    }
  }

  // For other types, pass through and let z.coerce.bigint() handle
  return value;
}, z.coerce.bigint());

/**
 * Type representing a validated BigInt.
 */
export type ApiBigInt = z.infer<typeof apiBigInt>;

/**
 * Type guard to check if a value can be parsed as a BigInt.
 *
 * @example
 * ```typescript
 * if (isApiBigInt("123456789")) {
 *   console.log("Valid BigInt value");
 * }
 * ```
 */
export function isApiBigInt(value: unknown): value is ApiBigInt {
  return apiBigInt.safeParse(value).success;
}

/**
 * Parse a value as BigInt or throw an error.
 *
 * @throws {ZodError} If the value cannot be parsed as a BigInt
 *
 * @example
 * ```typescript
 * const bigint = getApiBigInt("123456789"); // 123456789n
 * const invalid = getApiBigInt("abc"); // Throws ZodError
 * ```
 */
export function getApiBigInt(value: unknown): ApiBigInt {
  return apiBigInt.parse(value);
}

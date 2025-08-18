/**
 * Basis Points Validation Utilities
 *
 * This module provides Zod-based validation for basis points (bps) values.
 * Basis points are commonly used in finance to express percentages with precision.
 * 1 basis point = 0.01% = 0.0001
 * 10000 basis points = 100%
 * @module BasisPointsValidation
 */
import { z } from "zod";

/**
 * Creates a Zod schema that validates basis points values.
 *
 * Basis points must be:
 * - An integer (no decimal places)
 * - Between 0 and 10000 (0% to 100%)
 *
 * @returns A Zod schema that validates basis points
 * @example
 * ```typescript
 * // Basic validation
 * const schema = basisPoints();
 * schema.parse(0); // Valid (0%)
 * schema.parse(100); // Valid (1%)
 * schema.parse(1000); // Valid (10%)
 * schema.parse(10000); // Valid (100%)
 *
 * // Invalid values
 * schema.parse(-1); // Invalid - negative
 * schema.parse(10001); // Invalid - exceeds 100%
 * schema.parse(100.5); // Invalid - not an integer
 * ```
 */
export const basisPoints = () => {
  return z
    .int("Basis points must be an integer")
    .min(0, "Basis points cannot be negative")
    .max(10_000, "Basis points cannot exceed 10000 (100%)")
    .describe("Basis points value between 0 and 10000 (0% to 100%)");
};

/**
 * Type representing a validated basis points value.
 * Inferred from the basisPoints schema.
 */
export type BasisPoints = z.infer<ReturnType<typeof basisPoints>>;

// Helper functions

/**
 * Type guard function to check if a value is valid basis points.
 * @param value - The value to check
 * @returns `true` if the value is valid basis points, `false` otherwise
 * @example
 * ```typescript
 * if (isBasisPoints(250)) {
 *   // TypeScript knows this is valid BasisPoints
 *   console.log("Valid basis points: 2.5%");
 * }
 *
 * isBasisPoints(10000); // true (100%)
 * isBasisPoints(10001); // false (exceeds 100%)
 * isBasisPoints(50.5); // false (not an integer)
 * ```
 */
export function isBasisPoints(value: unknown): value is BasisPoints {
  return basisPoints().safeParse(value).success;
}

/**
 * Safely parse and validate basis points with error throwing.
 * @param value - The value to parse as basis points
 * @returns The validated basis points value
 * @throws {Error} If the value is not valid basis points
 * @example
 * ```typescript
 * try {
 *   const bps = getBasisPoints(250); // Returns 250
 *   const invalid = getBasisPoints(10001); // Throws Error
 * } catch (error) {
 *   console.error("Invalid basis points value");
 * }
 * ```
 */
export function getBasisPoints(value: unknown): BasisPoints {
  return basisPoints().parse(value);
}

/**
 * Convert basis points to a decimal percentage.
 * @param bps - The basis points value
 * @returns The decimal percentage (e.g., 250 bps = 0.025 = 2.5%)
 * @example
 * ```typescript
 * basisPointsToDecimal(100); // 0.01 (1%)
 * basisPointsToDecimal(250); // 0.025 (2.5%)
 * basisPointsToDecimal(10000); // 1 (100%)
 * ```
 */
export function basisPointsToDecimal(bps: BasisPoints): number {
  return bps / 10_000;
}

/**
 * Convert basis points to a percentage.
 * @param bps - The basis points value
 * @returns The percentage (e.g., 250 bps = 2.5%)
 * @example
 * ```typescript
 * basisPointsToPercentage(100); // 1
 * basisPointsToPercentage(250); // 2.5
 * basisPointsToPercentage(10000); // 100
 * ```
 */
export function basisPointsToPercentage(bps: BasisPoints): number {
  return bps / 100;
}

/**
 * Equity Class Validation Utilities
 *
 * This module provides Zod schemas for validating equity share classes,
 * which differentiate shares with varying voting rights, dividend preferences,
 * and control structures within a company.
 * @module EquityClassValidation
 */
import { z } from "zod";

/**
 * Available equity share classes.
 * @remarks
 * Standard classification system for multi-class share structures:
 * - `A`: Typically common shares with standard voting rights
 * - `B`: Often shares with enhanced voting rights or founder shares
 * - `C`: Usually non-voting or limited voting shares
 *
 * Note: Actual rights vary by company charter and jurisdiction
 */
export const equityClasses = ["A", "B", "C"] as const;

/**
 * Creates a Zod schema that validates equity share classes.
 * @returns A Zod enum schema for equity class validation
 * @example
 * ```typescript
 * const schema = equityClass();
 *
 * // Valid classes
 * schema.parse("A"); // Class A shares
 * schema.parse("B"); // Class B shares
 * schema.parse("C"); // Class C shares
 *
 * // Invalid class
 * schema.parse("D"); // Throws ZodError
 * schema.parse("Common"); // Throws ZodError - use categories for this
 * ```
 */
export const equityClass = () =>
  z.enum(equityClasses).describe("Class of equity shares");

/**
 * Type representing a validated equity share class.
 * Ensures type safety.
 */
export type EquityClass = z.infer<ReturnType<typeof equityClass>>;

/**
 * Type guard to check if a value is a valid equity class.
 * @param value - The value to check
 * @returns `true` if the value is a valid equity class, `false` otherwise
 * @example
 * ```typescript
 * const shareClass: unknown = "B";
 * if (isEquityClass(shareClass)) {
 *   // TypeScript knows shareClass is EquityClass
 *   console.log(`Valid share class: ${shareClass}`);
 *
 *   // Apply class-specific logic
 *   if (shareClass === "B") {
 *     applyEnhancedVotingRights();
 *   }
 * }
 * ```
 */
export function isEquityClass(value: unknown): value is EquityClass {
  return equityClass().safeParse(value).success;
}

/**
 * Safely parse and return an equity class or throw an error.
 * @param value - The value to parse as an equity class
 * @returns The validated equity class
 * @throws {Error} If the value is not a valid equity class
 * @example
 * ```typescript
 * try {
 *   const shareClass = getEquityClass("A"); // Returns "A" as EquityClass
 *   const invalid = getEquityClass("X"); // Throws Error
 * } catch (error) {
 *   console.error("Invalid equity class provided");
 * }
 *
 * // Use in share issuance
 * const classOfShares = getEquityClass(request.shareClass);
 * mintShares(investor, classOfShares, amount);
 * ```
 */
export function getEquityClass(value: unknown): EquityClass {
  return equityClass().parse(value);
}

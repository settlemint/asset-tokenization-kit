/**
 * Equity Class Validation Utilities
 *
 * This module provides Zod schemas for validating equity classes,
 * which represent standardized groupings of equity instruments
 * based on rights, structure, and investment style.
 * @module EquityClassValidation
 */
import * as z from "zod";

/**
 * Canonical equity classes used across the platform.
 * These values match the SettleMint asset taxonomy.
 *
 * - COMMON_EQUITY: Standard common shares
 * - PREFERRED_EQUITY: Shares with preference in dividends or liquidation
 * - MARKET_CAPITALIZATION_EQUITY: Grouped by company size (large, mid, small cap)
 * - GEOGRAPHIC_EQUITY: Grouped by region or country
 * - SECTOR_INDUSTRY_EQUITY: Grouped by sector/industry
 * - INVESTMENT_STYLE_EQUITY: Growth, value, blend, etc.
 * - INVESTMENT_STAGE_PRIVATE_EQUITY: Early, late, venture, etc.
 * - SPECIAL_CLASSES_EQUITY: Dual class, tracking, etc.
 */
export const equityClasses = [
  "COMMON_EQUITY",
  "PREFERRED_EQUITY",
  "MARKET_CAPITALIZATION_EQUITY",
  "GEOGRAPHIC_EQUITY",
  "SECTOR_INDUSTRY_EQUITY",
  "INVESTMENT_STYLE_EQUITY",
  "INVESTMENT_STAGE_PRIVATE_EQUITY",
  "SPECIAL_CLASSES_EQUITY",
] as const;

/**
 * Creates a Zod schema that validates equity classes.
 * @returns A Zod enum schema for equity class validation
 * @example
 * ```typescript
 * const schema = equityClass();
 *
 * // Valid classes
 * schema.parse("COMMON_EQUITY");
 * schema.parse("PREFERRED_EQUITY");
 *
 * // Invalid class
 * schema.parse("A"); // Throws ZodError
 * schema.parse("Class B"); // Throws ZodError
 * ```
 */
export const equityClass = () =>
  z.enum(equityClasses).describe("Class of equity");

/**
 * Type representing a validated equity class.
 * Ensures type safety.
 */
export type EquityClass = z.infer<ReturnType<typeof equityClass>>;

/**
 * Type guard to check if a value is a valid equity class.
 * @param value - The value to check
 * @returns `true` if the value is a valid equity class, `false` otherwise
 * @example
 * ```typescript
 * const cls: unknown = "MARKET_CAPITALIZATION_EQUITY";
 * if (isEquityClass(cls)) {
 *   // TypeScript knows cls is EquityClass
 *   console.log(`Valid equity class: ${cls}`);
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
 *   const cls = getEquityClass("COMMON_EQUITY"); // Returns "COMMON_EQUITY"
 *   const invalid = getEquityClass("A"); // Throws Error
 * } catch (error) {
 *   console.error("Invalid equity class provided");
 * }
 * ```
 */
export function getEquityClass(value: unknown): EquityClass {
  return equityClass().parse(value);
}

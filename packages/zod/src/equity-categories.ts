/**
 * Equity Category Validation Utilities
 *
 * This module provides Zod schemas for validating equity categories,
 * which classify different types of equity shares based on their rights
 * and restrictions in corporate structures.
 * @module EquityCategoryValidation
 */
import * as z from "zod";

/**
 * Available equity categories in corporate share structures.
 * These values match the canonical equity categories used across the platform.
 */
export const equityCategories = [
  "COMMON_EQUITY",
  "VOTING_COMMON_STOCK",
  "NON_VOTING_COMMON_STOCK",
  "CUMULATIVE_PREFERRED_STOCK",
  "NON_CUMULATIVE_PREFERRED_STOCK",
  "CONVERTIBLE_PREFERRED_STOCK",
  "REDEEMABLE_PREFERRED_STOCK",
  "LARGE_CAP_EQUITY",
  "MID_CAP_EQUITY",
  "SMALL_CAP_EQUITY",
  "MICRO_CAP_EQUITY",
  "DOMESTIC_EQUITY",
  "INTERNATIONAL_EQUITY",
  "GLOBAL_EQUITY",
  "EMERGING_MARKET_EQUITY",
  "FRONTIER_MARKET_EQUITY",
  "TECHNOLOGY",
  "FINANCIALS",
  "HEALTHCARE",
  "ENERGY",
  "CONSUMER_STAPLES",
  "CONSUMER_DISCRETIONARY",
  "INDUSTRIALS",
  "MATERIALS",
  "UTILITIES",
  "COMMUNICATION_SERVICES",
  "REAL_ESTATE",
  "GROWTH_EQUITY",
  "VALUE_EQUITY",
  "BLEND_EQUITY",
  "INCOME_EQUITY",
  "VENTURE_CAPITAL",
  "GROWTH_CAPITAL",
  "LEVERAGED_BUYOUTS",
  "MEZZANINE_FINANCING",
  "DISTRESSED_EQUITY",
  "RESTRICTED_STOCK",
  "ESOP_SHARES",
  "TRACKING_STOCKS",
  "DUAL_CLASS_SHARES",
] as const;

/**
 * Creates a Zod schema that validates equity categories.
 * @returns A Zod enum schema for equity category validation
 * @example
 * ```typescript
 * const schema = equityCategory();
 *
 * // Valid categories
 * schema.parse("COMMON_EQUITY");
 * schema.parse("VOTING_COMMON_STOCK");
 * schema.parse("RESTRICTED_STOCK");
 *
 * // Invalid category
 * schema.parse("common"); // Throws ZodError
 * ```
 */
export const equityCategory = () =>
  z.enum(equityCategories).describe("Category of equity");

/**
 * Type representing a validated equity category.
 * Ensures type safety.
 */
export type EquityCategory = z.infer<ReturnType<typeof equityCategory>>;

/**
 * Type guard to check if a value is a valid equity category.
 * @param value - The value to check
 * @returns `true` if the value is a valid equity category, `false` otherwise
 * @example
 * ```typescript
 * const shareType: unknown = "CUMULATIVE_PREFERRED_STOCK";
 * if (isEquityCategory(shareType)) {
 *   // TypeScript knows shareType is EquityCategory
 *   console.log(`Valid equity category: ${shareType}`);
 * }
 * ```
 */
export function isEquityCategory(value: unknown): value is EquityCategory {
  return equityCategory().safeParse(value).success;
}

/**
 * Safely parse and return an equity category or throw an error.
 * @param value - The value to parse as an equity category
 * @returns The validated equity category
 * @throws {Error} If the value is not a valid equity category
 * @example
 * ```typescript
 * try {
 *   const category = getEquityCategory("GROWTH_EQUITY"); // Returns "GROWTH_EQUITY"
 *   const invalid = getEquityCategory("options"); // Throws Error
 * } catch (error) {
 *   console.error("Invalid equity category provided");
 * }
 * ```
 */
export function getEquityCategory(value: unknown): EquityCategory {
  return equityCategory().parse(value);
}

/**
 * Fund Category Validation Utilities
 *
 * This module provides Zod schemas for validating fund categories,
 * ensuring they match the canonical enumerations used across the platform.
 * @module FundCategoryValidation
 */
import * as z from "zod";

/**
 * Canonical fund categories supported by the platform.
 *
 * Possible values are:
 * - "ACTIVIST"
 * - "COMMODITY_TRADING"
 * - "CONVERTIBLE_ARBITRAGE"
 * - "CREDIT"
 * - "CURRENCY_FX"
 * - "DISTRESSED_DEBT"
 * - "EMERGING_MARKETS"
 * - "EQUITY_HEDGE"
 * - "EVENT_DRIVEN"
 * - "FIXED_INCOME_ARBITRAGE"
 * - "FUND_OF_FUNDS"
 * - "GLOBAL_MACRO"
 * - "HIGH_FREQUENCY_TRADING"
 * - "MANAGED_FUTURES_CTA"
 * - "MARKET_NEUTRAL"
 * - "MERGER_ARBITRAGE"
 * - "MULTI_STRATEGY"
 * - "PRIVATE_EQUITY"
 * - "VENTURE_CAPITAL"
 */
export const fundCategories = [
  "ACTIVIST",
  "COMMODITY_TRADING",
  "CONVERTIBLE_ARBITRAGE",
  "CREDIT",
  "CURRENCY_FX",
  "DISTRESSED_DEBT",
  "EMERGING_MARKETS",
  "EQUITY_HEDGE",
  "EVENT_DRIVEN",
  "FIXED_INCOME_ARBITRAGE",
  "FUND_OF_FUNDS",
  "GLOBAL_MACRO",
  "HIGH_FREQUENCY_TRADING",
  "MANAGED_FUTURES_CTA",
  "MARKET_NEUTRAL",
  "MERGER_ARBITRAGE",
  "MULTI_STRATEGY",
  "PRIVATE_EQUITY",
  "VENTURE_CAPITAL",
] as const;

/**
 * Creates a Zod schema that validates fund categories.
 * @returns A Zod enum schema for fund category validation
 * @example
 * ```typescript
 * const schema = fundCategory();
 *
 * // Valid categories
 * schema.parse("ACTIVIST");
 * schema.parse("VENTURE_CAPITAL");
 *
 * // Invalid category
 * schema.parse("mutual"); // Throws ZodError
 * ```
 */
export const fundCategory = () =>
  z.enum(fundCategories).describe("Category of investment fund");

/**
 * Type representing a validated fund category.
 * Ensures type safety.
 */
export type FundCategory = z.infer<ReturnType<typeof fundCategory>>;

/**
 * Type guard to check if a value is a valid fund category.
 * @param value - The value to check
 * @returns `true` if the value is a valid fund category, `false` otherwise
 * @example
 * ```typescript
 * const fundType: unknown = "EVENT_DRIVEN";
 * if (isFundCategory(fundType)) {
 *   // TypeScript knows fundType is FundCategory
 *   console.log(`Valid fund category: ${fundType}`);
 * }
 * ```
 */
export function isFundCategory(value: unknown): value is FundCategory {
  return fundCategory().safeParse(value).success;
}

/**
 * Safely parse and return a fund category or throw an error.
 * @param value - The value to parse as a fund category
 * @returns The validated fund category
 * @throws {Error} If the value is not a valid fund category
 * @example
 * ```typescript
 * try {
 *   const category = getFundCategory("CREDIT"); // Returns "CREDIT"
 *   const invalid = getFundCategory("mutual"); // Throws Error
 * } catch (error) {
 *   console.error("Invalid fund category provided");
 * }
 * ```
 */
export function getFundCategory(value: unknown): FundCategory {
  return fundCategory().parse(value);
}

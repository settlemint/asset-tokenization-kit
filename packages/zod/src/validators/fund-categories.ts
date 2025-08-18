/**
 * Fund Category Validation Utilities
 *
 * This module provides Zod schemas for validating investment fund categories,
 * which classify different types of pooled investment vehicles based on their
 * structure, strategy, and regulatory framework.
 * @module FundCategoryValidation
 */
import { z } from "zod";

/**
 * Available investment fund categories.
 * @remarks
 * Major fund types supported by the platform:
 * - `mutual`: Mutual funds - open-ended pooled investments for retail investors
 * - `hedge`: Hedge funds - alternative investments for qualified investors
 * - `etf`: Exchange-Traded Funds - traded on exchanges like stocks
 * - `index`: Index funds - passive funds tracking market indices
 */
export const fundCategories = ["mutual", "hedge", "etf", "index"] as const;

/**
 * Creates a Zod schema that validates fund categories.
 * @returns A Zod enum schema for fund category validation
 * @example
 * ```typescript
 * const schema = fundCategory();
 *
 * // Valid categories
 * schema.parse("mutual"); // Traditional mutual fund
 * schema.parse("hedge");  // Alternative investment fund
 * schema.parse("etf");    // Exchange-traded fund
 * schema.parse("index");  // Passive index fund
 *
 * // Invalid category
 * schema.parse("reit"); // Throws ZodError
 * ```
 */
export const fundCategory = () => z.enum(fundCategories).describe("Category of investment fund");

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
 * const fundType: unknown = "etf";
 * if (isFundCategory(fundType)) {
 *   // TypeScript knows fundType is FundCategory
 *   console.log(`Valid fund category: ${fundType}`);
 *
 *   // Apply category-specific logic
 *   if (fundType === "hedge") {
 *     enforceAccreditedInvestorRequirements();
 *   }
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
 *   const category = getFundCategory("mutual"); // Returns "mutual"
 *   const invalid = getFundCategory("private"); // Throws Error
 * } catch (error) {
 *   console.error("Invalid fund category provided");
 * }
 *
 * // Use in fund creation
 * const fundType = getFundCategory(request.category);
 * createFund(fundType, fundDetails);
 * ```
 */
export function getFundCategory(value: unknown): FundCategory {
  return fundCategory().parse(value);
}

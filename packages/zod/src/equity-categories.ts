/**
 * Equity Category Validation Utilities
 *
 * This module provides Zod schemas for validating equity categories,
 * which classify different types of equity shares based on their rights
 * and restrictions in corporate structures.
 * @module EquityCategoryValidation
 */
import { z } from "zod";

/**
 * Available equity categories in corporate share structures.
 * @remarks
 * - `common`: Standard shares with voting rights and residual claims
 * - `preferred`: Shares with priority in dividends and liquidation
 * - `restricted`: Shares with transfer limitations or vesting schedules
 */
export const equityCategories = ["common", "preferred", "restricted"] as const;

/**
 * Creates a Zod schema that validates equity categories.
 * @returns A Zod enum schema for equity category validation
 * @example
 * ```typescript
 * const schema = equityCategory();
 *
 * // Valid categories
 * schema.parse("common");     // Standard voting shares
 * schema.parse("preferred");  // Priority dividend shares
 * schema.parse("restricted"); // Vesting or locked shares
 *
 * // Invalid category
 * schema.parse("convertible"); // Throws ZodError
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
 * const shareType: unknown = "preferred";
 * if (isEquityCategory(shareType)) {
 *   // TypeScript knows shareType is EquityCategory
 *   console.log(`Valid equity category: ${shareType}`);
 *
 *   // Apply category-specific logic
 *   if (shareType === "preferred") {
 *     calculatePreferredDividends();
 *   }
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
 *   const category = getEquityCategory("common"); // Returns "common"
 *   const invalid = getEquityCategory("options"); // Throws Error
 * } catch (error) {
 *   console.error("Invalid equity category provided");
 * }
 *
 * // Use in equity issuance
 * const shareCategory = getEquityCategory(request.category);
 * issueShares(shareCategory, amount);
 * ```
 */
export function getEquityCategory(value: unknown): EquityCategory {
  return equityCategory().parse(value);
}

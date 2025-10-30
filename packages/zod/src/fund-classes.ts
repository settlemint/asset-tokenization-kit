/**
 * Fund Class Validation Utilities
 *
 * This module provides Zod schemas for validating fund classes,
 * which represent standardized groupings of investment fund strategies
 * and styles (not investor share classes).
 * @module FundClassValidation
 */
import { z } from "zod";

/**
 * Canonical fund classes used across the platform.
 * These values match the SettleMint asset taxonomy for fund strategies and styles.
 *
 * - ABSOLUTE_RETURN: Seeks positive returns regardless of market direction
 * - CORE_BLEND: Combines core and blend strategies
 * - DIVERSIFIED: Broadly diversified across assets or strategies
 * - EARLY_STAGE: Focused on early-stage investments
 * - FACTOR_BASED: Uses factor investing (value, momentum, etc.)
 * - GROWTH_FOCUSED: Emphasizes growth opportunities
 * - INCOME_FOCUSED: Prioritizes income generation
 * - LARGE_CAP: Focused on large capitalization assets
 * - LONG_EQUITY: Long-only equity strategies
 * - LONG_SHORT_EQUITY: Combines long and short equity positions
 * - MARKET_NEUTRAL: Seeks to neutralize market risk
 * - MID_CAP: Focused on mid capitalization assets
 * - MOMENTUM_ORIENTED: Uses momentum-based strategies
 * - OPPORTUNISTIC: Flexible, opportunistic allocation
 * - PRE_SERIES_B: Pre-Series B stage investments
 * - QUANTITATIVE_ALGORITHMIC: Quant/algorithmic strategies
 * - REGIONAL: Focused on specific regions
 * - SECTOR_SPECIFIC: Focused on specific sectors
 * - SEED_PRE_SEED: Seed and pre-seed stage investments
 * - SERIES_B_LATE_STAGE: Series B and later stage investments
 * - SHORT_EQUITY: Short-only equity strategies
 * - SMALL_CAP: Focused on small capitalization assets
 * - TACTICAL_ASSET_ALLOCATION: Tactical allocation across assets
 * - VALUE_FOCUSED: Value investing strategies
 */
export const fundClasses = [
  "ABSOLUTE_RETURN",
  "CORE_BLEND",
  "DIVERSIFIED",
  "EARLY_STAGE",
  "FACTOR_BASED",
  "GROWTH_FOCUSED",
  "INCOME_FOCUSED",
  "LARGE_CAP",
  "LONG_EQUITY",
  "LONG_SHORT_EQUITY",
  "MARKET_NEUTRAL",
  "MID_CAP",
  "MOMENTUM_ORIENTED",
  "OPPORTUNISTIC",
  "PRE_SERIES_B",
  "QUANTITATIVE_ALGORITHMIC",
  "REGIONAL",
  "SECTOR_SPECIFIC",
  "SEED_PRE_SEED",
  "SERIES_B_LATE_STAGE",
  "SHORT_EQUITY",
  "SMALL_CAP",
  "TACTICAL_ASSET_ALLOCATION",
  "VALUE_FOCUSED",
] as const;

/**
 * Creates a Zod schema that validates fund classes.
 * @returns A Zod enum schema for fund class validation
 * @example
 * ```typescript
 * const schema = fundClass();
 *
 * // Valid classes
 * schema.parse("ABSOLUTE_RETURN");
 * schema.parse("LONG_SHORT_EQUITY");
 * schema.parse("VALUE_FOCUSED");
 *
 * // Invalid class
 * schema.parse("institutional"); // Throws ZodError
 * ```
 */
export const fundClass = () =>
  z.enum(fundClasses).describe("Class of investment fund");

/**
 * Type representing a validated fund class.
 * Ensures type safety.
 */
export type FundClass = z.infer<ReturnType<typeof fundClass>>;

/**
 * Type guard to check if a value is a valid fund class.
 * @param value - The value to check
 * @returns `true` if the value is a valid fund class, `false` otherwise
 * @example
 * ```typescript
 * const cls: unknown = "LONG_SHORT_EQUITY";
 * if (isFundClass(cls)) {
 *   // TypeScript knows cls is FundClass
 *   console.log(`Valid fund class: ${cls}`);
 * }
 * ```
 */
export function isFundClass(value: unknown): value is FundClass {
  return fundClass().safeParse(value).success;
}

/**
 * Safely parse and return a fund class or throw an error.
 * @param value - The value to parse as a fund class
 * @returns The validated fund class
 * @throws {Error} If the value is not a valid fund class
 * @example
 * ```typescript
 * try {
 *   const cls = getFundClass("ABSOLUTE_RETURN"); // Returns "ABSOLUTE_RETURN"
 *   const invalid = getFundClass("institutional"); // Throws Error
 * } catch (error) {
 *   console.error("Invalid fund class provided");
 * }
 * ```
 */
export function getFundClass(value: unknown): FundClass {
  return fundClass().parse(value);
}

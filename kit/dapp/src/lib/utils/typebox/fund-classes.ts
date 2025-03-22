/**
 * TypeBox validators for fund classes
 *
 * This module provides TypeBox schemas for validating fund classes,
 * ensuring they match predefined enumerations.
 */
import type { SchemaOptions } from "@sinclair/typebox";
import { t } from "elysia";

/**
 * Enum of valid fund classes
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
 * Validates a fund class
 *
 * @param options - Additional schema options
 * @returns A TypeBox schema that validates fund classes
 */
export const FundClass = (options?: SchemaOptions) =>
  t.UnionEnum(fundClasses, {
    ...options,
  });

/**
 * TypeBox validators for equity categories
 *
 * This module provides TypeBox schemas for validating equity categories,
 * ensuring they match predefined enumerations.
 */
import type { SchemaOptions } from "@sinclair/typebox";
import { t } from "elysia/type-system";

/**
 * Enum of valid equity categories
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
 * Validates an equity category
 *
 * @param options - Additional schema options
 * @returns A TypeBox schema that validates equity categories
 */
export const EquityCategory = (options?: SchemaOptions) =>
  t.UnionEnum(equityCategories, {
    ...options,
  });

/**
 * TypeBox validators for fund categories
 *
 * This module provides TypeBox schemas for validating fund categories,
 * ensuring they match predefined enumerations.
 */
import type { SchemaOptions } from "@sinclair/typebox";
import { t } from "elysia/type-system";
/**
 * Enum of valid fund categories
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
 * Validates a fund category
 *
 * @param options - Additional schema options
 * @returns A TypeBox schema that validates fund categories
 */
export const FundCategory = (options?: SchemaOptions) =>
  t.UnionEnum(fundCategories, {
    ...options,
  });

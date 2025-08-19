/**
 * Exchange Rates Sync Schema
 *
 * Validation schemas for synchronizing exchange rates with external providers.
 * @module ExchangeRatesSyncSchema
 */
import { fiatCurrency } from "@/lib/zod/validators/fiat-currency";
import { z } from "zod";
import { exchangeRateProvider } from "../schemas";

/**
 * Schema for syncing exchange rates.
 * This is an admin operation for updating the exchange rate database.
 */
export const ExchangeRatesSyncSchema = z.object({
  /** Force sync even if recent data exists */
  force: z.boolean().default(false),
});

/**
 * Internal schema with provider for the sync function.
 * Not exposed to API users.
 */
export const ExchangeRatesSyncInternalSchema = z.object({
  /** Provider to sync from (defaults to 'er-api') */
  provider: exchangeRateProvider().default("er-api"),
  /** Base currency to use for sync (defaults to USD) */
  baseCurrency: fiatCurrency().default("USD"),
  /** Force sync even if recent data exists */
  force: z.boolean().default(false),
});

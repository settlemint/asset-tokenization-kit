/**
 * Exchange Rate Schemas
 *
 * Internal schemas for exchange rate operations.
 * Kept close to the route implementations for better cohesion.
 * @module ExchangeRateSchemas
 */
import * as z from "zod";

/**
 * Supported exchange rate providers.
 * Each provider has different data sources and update frequencies.
 */
export const exchangeRateProviders = ["er-api", "ECB", "manual"] as const;

/**
 * Schema for exchange rate provider validation.
 */
export const exchangeRateProvider = () =>
  z.enum(exchangeRateProviders).describe("Exchange rate data provider");

/**
 * Type representing a validated exchange rate provider.
 */
export type ExchangeRateProvider = z.infer<
  ReturnType<typeof exchangeRateProvider>
>;

/**
 * Schema for the ExchangeRate-API response.
 * Used when fetching rates from the er-api.com service.
 */
export const exchangeRateApiResponseSchema = z.object({
  /** API result status */
  result: z.literal("success"),
  /** Data provider name */
  provider: z.string(),
  /** API documentation URL */
  documentation: z.string(),
  /** Terms of use URL */
  terms_of_use: z.string(),
  /** Unix timestamp of last update */
  time_last_update_unix: z.number(),
  /** UTC timestamp of last update */
  time_last_update_utc: z.string(),
  /** Unix timestamp of next update */
  time_next_update_unix: z.number(),
  /** UTC timestamp of next update */
  time_next_update_utc: z.string(),
  /** Unix timestamp when data expires */
  time_eol_unix: z.number(),
  /** Base currency code */
  base_code: z.string(),
  /** Exchange rates object */
  rates: z.record(z.string(), z.number()),
});

/**
 * Type representing the ExchangeRate-API response.
 */
export type ExchangeRateApiResponse = z.infer<
  typeof exchangeRateApiResponseSchema
>;

/**
 * Exchange Rates Update Schema
 *
 * Validation schemas for manually updating exchange rates.
 * @module ExchangeRatesUpdateSchema
 */
import { fiatCurrency } from "@atk/zod/validators/fiat-currency";
import { z } from "zod";

/**
 * Schema for updating an exchange rate.
 * Used for manual rate overrides.
 */
export const ExchangeRatesUpdateSchema = z.object({
  /** Base currency code */
  baseCurrency: fiatCurrency(),
  /** Quote currency code */
  quoteCurrency: fiatCurrency(),
  /** New exchange rate value */
  rate: z.number().positive("Rate must be positive"),
  /** Optional effective date (defaults to now) */
  effectiveAt: z.date().optional(),
});

/**
 * Schema for exchange rate update response.
 */
export const ExchangeRatesUpdateOutputSchema = z.object({
  /** Operation success status */
  success: z.boolean(),
  /** Updated rate details */
  rate: z.object({
    baseCurrency: fiatCurrency(),
    quoteCurrency: fiatCurrency(),
    rate: z.number().positive(),
    effectiveAt: z.date(),
  }),
});

/**
 * Type for exchange rate update input
 */
export type ExchangeRatesUpdateInput = z.infer<
  typeof ExchangeRatesUpdateSchema
>;

/**
 * Type for exchange rate update output
 */
export type ExchangeRatesUpdateOutput = z.infer<
  typeof ExchangeRatesUpdateOutputSchema
>;

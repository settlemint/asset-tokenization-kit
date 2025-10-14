/**
 * Exchange Rates Delete Schema
 *
 * Validation schemas for deleting manual exchange rates.
 * @module ExchangeRatesDeleteSchema
 */
import { fiatCurrency } from "@atk/zod/fiat-currency";
import * as z from "zod";

/**
 * Schema for deleting a manual exchange rate.
 * Only manual rates can be deleted.
 */
export const ExchangeRatesDeleteSchema = z.object({
  /** Base currency code */
  baseCurrency: fiatCurrency(),
  /** Quote currency code */
  quoteCurrency: fiatCurrency(),
});

/**
 * Type for exchange rate delete input
 */
export type ExchangeRatesDeleteInput = z.infer<
  typeof ExchangeRatesDeleteSchema
>;

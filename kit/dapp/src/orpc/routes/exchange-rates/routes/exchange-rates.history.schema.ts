/**
 * Exchange Rates History Schema
 *
 * Validation schemas for retrieving historical exchange rates.
 * @module ExchangeRatesHistorySchema
 */
import {
  type FiatCurrency,
  fiatCurrency,
} from "@atk/zod/validators/fiat-currency";
import { z } from "zod";

/**
 * Schema for querying historical exchange rates.
 * Supports date range filtering.
 */
export const ExchangeRatesHistorySchema = z.object({
  /** Base currency code */
  baseCurrency: fiatCurrency(),
  /** Quote currency code */
  quoteCurrency: fiatCurrency(),
  /** Start date for historical data */
  startDate: z.date().optional(),
  /** End date for historical data */
  endDate: z.date().optional(),
  /** Maximum number of records to return */
  limit: z.number().int().positive().max(1000).default(100),
});

/**
 * Type for exchange rate history input
 */
export type ExchangeRatesHistoryInput = z.infer<
  typeof ExchangeRatesHistorySchema
>;

/**
 * Type for historical exchange rate item
 */
export interface ExchangeRateHistoryItem {
  baseCurrency: FiatCurrency;
  quoteCurrency: FiatCurrency;
  rate: number;
  effectiveAt: Date;
}

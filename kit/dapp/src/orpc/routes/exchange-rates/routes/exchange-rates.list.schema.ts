/**
 * Exchange Rates List Schema
 *
 * Validation schemas for listing exchange rates with pagination.
 * @module ExchangeRatesListSchema
 */
import { PaginatedListSchema } from "@/orpc/routes/common/schemas/paginated-list.schema";
import { type FiatCurrency, fiatCurrency } from "@atk/zod/fiat-currency";
import * as z from "zod";

/**
 * Schema for listing exchange rates with optional filters.
 */
export const ExchangeRatesListSchema = PaginatedListSchema.extend({
  /** Optional base currency filter */
  baseCurrency: fiatCurrency().optional(),
  /** Optional quote currency filter */
  quoteCurrency: fiatCurrency().optional(),
});

/**
 * Output schema for exchange rates list response.
 */
export const ExchangeRatesListOutputSchema = z.object({
  /** Array of exchange rate records */
  items: z.array(
    z.object({
      baseCurrency: fiatCurrency(),
      quoteCurrency: fiatCurrency(),
      rate: z.number(),
      effectiveAt: z.date(),
      updatedAt: z.date(),
    })
  ),
  /** Total number of records */
  totalCount: z.number(),
  /** Current offset */
  offset: z.number(),
  /** Current limit */
  limit: z.number().optional(),
});

/**
 * Type for the exchange rate list item
 */
export interface ExchangeRateListItem {
  baseCurrency: FiatCurrency;
  quoteCurrency: FiatCurrency;
  rate: number;
  effectiveAt: Date;
  updatedAt: Date;
}

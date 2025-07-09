/**
 * Exchange Rates List Schema
 *
 * Validation schemas for listing exchange rates with pagination.
 * @module ExchangeRatesListSchema
 */
import {
  fiatCurrency,
  type FiatCurrency,
} from "@/lib/zod/validators/fiat-currency";
import { ListSchema } from "@/orpc/routes/common/schemas/list.schema";
import { z } from "zod/v4";

/**
 * Schema for listing exchange rates with optional filters.
 */
export const ExchangeRatesListSchema = ListSchema.extend({
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

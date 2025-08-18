/**
 * Exchange Rates Read Schema
 *
 * Validation schemas for reading exchange rates between currency pairs.
 * @module ExchangeRatesReadSchema
 */
import { fiatCurrency } from "@atk/zod/validators/fiat-currency";
import { z } from "zod";

/**
 * Schema for reading an exchange rate.
 * Validates the currency pair parameters.
 */
export const ExchangeRatesReadSchema = z.object({
  /** Base currency code (converting from) */
  baseCurrency: fiatCurrency(),
  /** Quote currency code (converting to) */
  quoteCurrency: fiatCurrency(),
});

/**
 * Schema for exchange rate read response.
 * Returns the current rate between two currencies.
 */
export const ExchangeRatesReadOutputSchema = z
  .object({
    /** Base currency code */
    baseCurrency: fiatCurrency(),
    /** Quote currency code */
    quoteCurrency: fiatCurrency(),
    /** Exchange rate value */
    rate: z.number().positive(),
    /** When this rate became effective */
    effectiveAt: z.date(),
  })
  .nullable();

/**
 * Type for exchange rate read input
 */
export type ExchangeRatesReadInput = z.infer<typeof ExchangeRatesReadSchema>;

/**
 * Type for exchange rate read output
 */
export type ExchangeRatesReadOutput = z.infer<
  typeof ExchangeRatesReadOutputSchema
>;

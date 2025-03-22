/**
 * TypeBox validators for fiat currencies
 *
 * This module provides TypeBox schemas for validating fiat currencies,
 * ensuring they match predefined enumerations.
 */
import { type SchemaOptions, Type } from "@sinclair/typebox";

/**
 * Enum of valid fiat currencies
 */
export const fiatCurrencies = [
  "EUR",
  "USD",
  "GBP",
  "CHF",
  "JPY",
  "AED",
  "SGD",
  "SAR",
] as const;

/**
 * Validates a fiat currency
 *
 * @param options - Additional schema options
 * @returns A TypeBox schema that validates fiat currencies
 */
export const FiatCurrency = (options?: SchemaOptions) =>
  Type.UnionEnum(fiatCurrencies, {
    ...options,
  });

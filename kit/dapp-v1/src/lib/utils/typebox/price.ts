/**
 * TypeBox validators for price
 *
 * This module provides TypeBox schemas for validating prices,
 * which consist of an amount and a fiat currency.
 */
import type { SchemaOptions, Static } from "@sinclair/typebox";
import { t } from "elysia/type-system";
import { FiatCurrency } from "./fiat-currency";

/**
 * Validates a price with amount and currency
 *
 * @param options - Additional schema options
 * @returns A TypeBox schema that validates prices
 */
export const Price = (options?: SchemaOptions) =>
  t.Object(
    {
      amount: t.Number({
        minimum: 0,
        maximum: Number.MAX_SAFE_INTEGER,
        decimals: 6,
        description: "The numeric amount of the price",
      }),
      currency: FiatCurrency({
        description: "The fiat currency of the price",
      }),
    },
    {
      ...options,
      description: "A price consisting of an amount and fiat currency",
    }
  );

export type Price = Static<ReturnType<typeof Price>>;

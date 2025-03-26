/**
 * TypeBox validator for BigDecimal
 *
 * This module provides a TypeBox schema for validating and transforming decimal values
 * with precision handling using BigNumber.js.
 */
import type { SchemaOptions } from "@sinclair/typebox";
import { BigNumber } from "bignumber.js";
import { FormatRegistry, t, TypeRegistry } from "elysia/type-system";

// BigDecimal format validator
if (!FormatRegistry.Has("big-decimal")) {
  FormatRegistry.Set("big-decimal", (value) => {
    try {
      if (typeof value === "string" || typeof value === "number") {
        const bn = new BigNumber(value);
        return !bn.isNaN();
      }
      return false;
    } catch {
      return false;
    }
  });
}

if (!TypeRegistry.Has("big-decimal")) {
  TypeRegistry.Set<BigNumber>("big-decimal", (_schema, value) => {
    return BigNumber.isBigNumber(value);
  });
}

/**
 * Validates and transforms a decimal number string using BigNumber.js
 *
 * This validator ensures the input is a valid decimal number
 * with arbitrary precision support and transforms it into a BigNumber instance.
 *
 * @param options - Additional schema options
 * @returns A TypeBox schema that validates and transforms decimal numbers
 */
export const BigDecimal = (options?: SchemaOptions) =>
  t
    .Transform(
      t.Union([
        t.String({
          format: "big-decimal",
          title: "BigDecimal",
          description:
            "A string representation of a decimal number with arbitrary precision using BigNumber.js",
          examples: ["123.456", "-789.012", "1000", "0.00000001"],
          ...options,
        }),
        t.Number({
          title: "BigDecimal",
          description:
            "A number that will be converted to a string for arbitrary precision using BigNumber.js",
          examples: [123.456, -789.012, 1000, 0.00000001],
          ...options,
        }),
      ])
    )
    .Decode((value) => new BigNumber(value).toNumber())
    .Encode((value) => value.toString());

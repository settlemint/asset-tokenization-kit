/**
 * TypeBox validator for BigDecimal
 *
 * This module provides a TypeBox schema for validating and transforming decimal values
 * with precision handling using BigNumber.js.
 */
import {
  type SchemaOptions,
  FormatRegistry,
  Type,
  TypeRegistry,
} from "@sinclair/typebox";
import { BigNumber } from "bignumber.js";

// BigDecimal format validator
if (!FormatRegistry.Has("big-decimal")) {
  FormatRegistry.Set("big-decimal", (value) => {
    if (typeof value !== "string") return false;
    try {
      const bn = new BigNumber(value);
      return !bn.isNaN();
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
  Type.Transform(
    Type.String({
      format: "big-decimal",
      title: "BigDecimal",
      description:
        "A string representation of a decimal number with arbitrary precision using BigNumber.js",
      examples: ["123.456", "-789.012", "1000", "0.00000001"],
      ...options,
    })
  )
    .Decode((value) => new BigNumber(value).toNumber())
    .Encode((value) => value.toString());

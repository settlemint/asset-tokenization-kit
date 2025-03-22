/**
 * TypeBox validator for BigDecimal
 *
 * This module provides a TypeBox schema for validating and transforming decimal values
 * with precision handling using BigNumber.js.
 */
import {
  FormatRegistry,
  type SchemaOptions,
  Type,
  TypeRegistry,
} from "@sinclair/typebox";

// BigDecimal format validator
if (!FormatRegistry.Has("big-int")) {
  FormatRegistry.Set("big-int", (value) => {
    if (typeof value !== "string") return false;
    try {
      BigInt(value);
      return true;
    } catch {
      return false;
    }
  });
}

if (!TypeRegistry.Has("big-int")) {
  TypeRegistry.Set<bigint>("big-int", (_schema, value) => {
    return typeof value === "bigint";
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
export const StringifiedBigInt = (options?: SchemaOptions) =>
  Type.Transform(
    Type.String({
      format: "big-int",
      title: "BigInt",
      description: "A string representation of a large number",
      examples: ["123456789012345678901234567890123"],
      ...options,
    })
  )
    .Decode((value) => BigInt(value))
    .Encode((value) => value.toString());

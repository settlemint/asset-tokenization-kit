/**
 * TypeBox validator for token symbols
 *
 * This module provides a TypeBox schema for validating token symbols,
 * ensuring they contain only uppercase letters and numbers.
 */
import type { SchemaOptions } from "@sinclair/typebox";
import { FormatRegistry, t, TypeRegistry } from "elysia/type-system";

// Token symbol format validator
if (!FormatRegistry.Has("asset-symbol")) {
  FormatRegistry.Set("asset-symbol", (value) => {
    if (typeof value !== "string") return false;
    return value.length > 0 && /^[A-Z0-9]+$/.test(value);
  });
}

if (!TypeRegistry.Has("asset-symbol")) {
  TypeRegistry.Set<string>("asset-symbol", (_schema, value) => {
    return (
      typeof value === "string" && value.length > 0 && /^[A-Z0-9]+$/.test(value)
    );
  });
}

/**
 * Validates a token symbol
 *
 * Ensures the symbol contains only uppercase letters and numbers.
 *
 * @param options - Additional schema options
 * @returns A TypeBox schema that validates token symbols
 */
export const AssetSymbol = (options?: SchemaOptions) =>
  t.String({
    format: "asset-symbol",
    title: "Asset Symbol",
    description: "An asset symbol consisting of uppercase letters and numbers",
    examples: ["BTC", "ETH", "USDT"],
    ...options,
  });

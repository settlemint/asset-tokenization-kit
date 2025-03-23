/**
 * TypeBox validator for ISIN codes
 *
 * This module provides a TypeBox schema for validating International Securities Identification Numbers (ISIN),
 * ensuring they conform to the ISO 6166 standard format.
 */
import type { SchemaOptions } from "@sinclair/typebox";
import { FormatRegistry, t, TypeRegistry } from "elysia/type-system";

// ISIN format validator
if (!FormatRegistry.Has("isin")) {
  FormatRegistry.Set("isin", (value) => {
    if (typeof value !== "string") return false;
    return /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(value);
  });
}

if (!TypeRegistry.Has("isin")) {
  TypeRegistry.Set<string>("isin", (_schema, value) => {
    return (
      typeof value === "string" && /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(value)
    );
  });
}

/**
 * Validates an ISIN code
 *
 * @param options - Additional schema options
 * @returns A TypeBox schema that validates ISIN codes
 */
export const Isin = (options?: SchemaOptions) =>
  t.String({
    format: "isin",
    title: "ISIN",
    description: "An ISO 6166 International Securities Identification Number",
    examples: ["US0378331005", "GB0002634946", "JP3633400001"],
    ...options,
  });

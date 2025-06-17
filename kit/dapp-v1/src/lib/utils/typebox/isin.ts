/**
 * TypeBox validator for ISIN codes
 *
 * This module provides a TypeBox schema for validating International Securities Identification Numbers (ISIN),
 * ensuring they conform to the ISO 6166 standard format.
 */
import type { SchemaOptions } from "@sinclair/typebox";
import { FormatRegistry, t, TypeRegistry } from "elysia/type-system";

const ISIN_PATTERN = /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/;

// ISIN format validator
if (!FormatRegistry.Has("isin")) {
  FormatRegistry.Set("isin", (value) => {
    if (typeof value !== "string") return false;
    if (value === "") return true;
    return ISIN_PATTERN.test(value);
  });
}

if (!TypeRegistry.Has("isin")) {
  TypeRegistry.Set<string>("isin", (_schema, value) => {
    if (typeof value !== "string") return false;
    if (value === "") return true;
    return ISIN_PATTERN.test(value);
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

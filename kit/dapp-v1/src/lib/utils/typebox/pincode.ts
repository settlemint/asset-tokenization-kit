/**
 * TypeBox validator for PIN codes
 *
 * This module provides a TypeBox schema for validating PIN codes,
 * ensuring they are exactly 6 digits and securely processed.
 */
import type { SchemaOptions } from "@sinclair/typebox";
import { FormatRegistry, t, TypeRegistry } from "elysia/type-system";

// PIN code format validator
if (!FormatRegistry.Has("pincode")) {
  FormatRegistry.Set("pincode", (value) => {
    if (typeof value !== "string") return false;
    return /^\d{6}$/.test(value);
  });
}

if (!TypeRegistry.Has("pincode")) {
  TypeRegistry.Set<string>("pincode", (_schema, value) => {
    return typeof value === "string" && /^\d{6}$/.test(value);
  });
}

/**
 * Validates a PIN code
 *
 * @param options - Additional schema options
 * @returns A TypeBox schema that validates PIN codes
 */
export const Pincode = (options?: SchemaOptions) =>
  t.String({
    format: "pincode",
    title: "PIN Code",
    description: "A 6-digit PIN code",
    examples: [123456, 999999],
    minLength: 6,
    maxLength: 6,
    ...options,
  });

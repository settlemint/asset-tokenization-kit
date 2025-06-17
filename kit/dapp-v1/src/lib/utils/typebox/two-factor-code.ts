/**
 * TypeBox validator for two factor codes
 *
 * This module provides a TypeBox schema for validating two factor codes,
 * ensuring they are exactly 6 digits and securely processed.
 */
import type { SchemaOptions } from "@sinclair/typebox";
import { FormatRegistry, t, TypeRegistry } from "elysia/type-system";

// Two factor code format validator
if (!FormatRegistry.Has("two-factor-code")) {
  FormatRegistry.Set("two-factor-code", (value) => {
    if (typeof value !== "string") return false;
    return /^\d{6}$/.test(value);
  });
}

if (!TypeRegistry.Has("two-factor-code")) {
  TypeRegistry.Set<string>("two-factor-code", (_schema, value) => {
    return typeof value === "string" && /^\d{6}$/.test(value);
  });
}

/**
 * Validates a two factor code
 *
 * @param options - Additional schema options
 * @returns A TypeBox schema that validates two factor codes
 */
export const TwoFactorCode = (options?: SchemaOptions) =>
  t.String({
    format: "two-factor-code",
    title: "Two Factor Code",
    description: "A 6-digit two factor code",
    examples: [123456, 999999],
    minLength: 6,
    maxLength: 6,
    ...options,
  });

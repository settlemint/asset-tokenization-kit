/**
 * TypeBox validator for secret codes
 *
 * This module provides a TypeBox schema for validating secret codes,
 * ensuring they are exactly 10 digits and securely processed.
 */
import type { SchemaOptions } from "@sinclair/typebox";
import { FormatRegistry, t, TypeRegistry } from "elysia/type-system";

// Secret code format validator
if (!FormatRegistry.Has("secret-code")) {
  FormatRegistry.Set("secret-code", (value) => {
    if (typeof value !== "string") return false;
    return /^[a-zA-Z0-9]{10}$/.test(value);
  });
}

if (!TypeRegistry.Has("secret-code")) {
  TypeRegistry.Set<string>("secret-code", (_schema, value) => {
    return typeof value === "string" && /^[a-zA-Z0-9]{10}$/.test(value);
  });
}

/**
 * Validates a secret code
 *
 * @param options - Additional schema options
 * @returns A TypeBox schema that validates secret codes
 */
export const SecretCode = (options?: SchemaOptions) =>
  t.String({
    format: "secret-code",
    title: "Secret Code",
    description: "A 10-digit secret code",
    examples: ["a1e2-f3g4", "b5h6-i7j8"],
    minLength: 10,
    maxLength: 10,
    ...options,
  });

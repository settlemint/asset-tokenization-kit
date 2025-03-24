/**
 * TypeBox validator for Ethereum transaction or block hashes
 *
 * This module provides a TypeBox schema for validating Ethereum hashes,
 * ensuring they conform to the correct format.
 */
import type { SchemaOptions } from "@sinclair/typebox";
import { FormatRegistry, t, TypeRegistry } from "elysia/type-system";
import { isHash, type Hash as HashType } from "viem";

// Ethereum hash format validator
if (!FormatRegistry.Has("eth-hash")) {
  FormatRegistry.Set("eth-hash", (value) => {
    return isHash(value);
  });
}

if (!TypeRegistry.Has("eth-hash")) {
  TypeRegistry.Set<HashType>("eth-hash", (_schema, value) => {
    return typeof value === "string" && isHash(value);
  });
}

/**
 * Validates an Ethereum transaction or block hash
 *
 * @param options - Additional schema options
 * @returns A TypeBox schema that validates Ethereum hashes
 */
export const Hash = (options?: SchemaOptions) =>
  t.Unsafe<HashType>(
    t.String({
      format: "eth-hash",
      title: "Ethereum Hash",
      description: "Ethereum transaction or block hash",
      examples: [
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      ],
      ...options,
    })
  );

/**
 * Validates an array of Ethereum hashes
 *
 * @param options - Additional schema options
 * @returns A TypeBox schema that validates an array of Ethereum hashes
 */
export const Hashes = (options?: SchemaOptions) =>
  t.Array(Hash(), { ...options });

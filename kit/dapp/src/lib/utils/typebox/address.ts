/**
 * TypeBox validator for Ethereum addresses
 *
 * This module provides a TypeBox schema for validating Ethereum addresses,
 * ensuring they conform to the correct format and can be converted to checksummed format.
 */
import type { SchemaOptions } from "@sinclair/typebox";
import { t } from "elysia";
import { FormatRegistry, TypeRegistry } from "elysia/type-system";
import { getAddress, isAddress, type Address } from "viem";
// Ethereum address format validator
if (!FormatRegistry.Has("eth-address")) {
  FormatRegistry.Set("eth-address", (value) => {
    if (typeof value !== "string") return false;
    return isAddress(value);
  });
}

if (!TypeRegistry.Has("eth-address")) {
  TypeRegistry.Set<Address>("eth-address", (_schema, value) => {
    return typeof value === "string" && isAddress(value);
  });
}

/**
 * Validates and normalizes an Ethereum address
 *
 * @returns A TypeBox schema that validates Ethereum addresses
 */
export const EthereumAddress = (options?: SchemaOptions) =>
  t.String({
    format: "eth-address",
    transform: [(value: string) => getAddress(value)],
    title: "Ethereum Address",
    description: "A valid Ethereum address",
    examples: ["0x71C7656EC7ab88b098defB751B7401B5f6d8976F"],
    ...options,
  });

/**
 * TypeBox validator for Ethereum addresses
 *
 * This module provides a TypeBox schema for validating Ethereum addresses,
 * ensuring they conform to the correct format and can be converted to checksummed format.
 */
import type { SchemaOptions } from "@sinclair/typebox";
import { FormatRegistry, t, TypeRegistry } from "elysia/type-system";
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
 * @returns A TypeBox schema that validates Ethereum addresses and types as Viem's Address
 */
export const EthereumAddress = (options?: SchemaOptions) =>
  t
    .Transform(
      t.String({
        format: "eth-address",
        title: "Ethereum Address",
        description: "A valid Ethereum address",
        examples: ["0x71C7656EC7ab88b098defB751B7401B5f6d8976F"],
        ...options,
      })
    )
    .Decode((value: string) => getAddress(value))
    .Encode((value: Address) => value);

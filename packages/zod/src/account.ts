/**
 * Account Validation Utilities
 *
 * This module provides Zod schemas for validating Account entities from TheGraph,
 * matching the structure defined in the subgraph schema.graphql. Account entities
 * represent Ethereum addresses with metadata about whether they are contracts.
 * @module AccountValidation
 */

import * as z from "zod";
import { ethereumAddress } from "./ethereum-address";

/**
 * Creates a Zod schema that validates an Account entity from TheGraph.
 * @remarks
 * This schema matches the Account type defined in the subgraph schema.graphql:
 * - id: Bytes! (Ethereum address as string in GraphQL queries)
 * - isContract: Boolean! (whether this address is a smart contract)
 *
 * This is used throughout the system for access control roles, token balances,
 * event tracking, and other entities that reference accounts.
 * @returns A Zod object schema for Account validation
 * @example
 * ```typescript
 * const schema = accountSchema();
 * const result = schema.parse({
 *   id: "0x1234567890abcdef1234567890abcdef12345678",
 *   isContract: false
 * });
 * ```
 */
export const account = () =>
  z.object({
    id: ethereumAddress,
    isContract: z
      .boolean()
      .describe(
        "Whether this address is a smart contract (true) or EOA (false)"
      ),
  });

/**
 * Type inference for the Account schema
 */
export type Account = z.infer<ReturnType<typeof account>>;

/**
 * Creates an array validator for Account entities.
 * Useful for validating lists of accounts in access control roles.
 * @returns A Zod array schema that validates Account entities
 * @example
 * ```typescript
 * const schema = accountArraySchema();
 * schema.parse([
 *   { id: "0x123...", isContract: false },
 *   { id: "0x456...", isContract: true }
 * ]);
 * ```
 */
export const accountArray = () =>
  z.array(account()).describe("Array of Account entities");

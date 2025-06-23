/**
 * Token Contract Definition for oRPC
 *
 * This contract defines the factory namespace for token-related operations.
 * It provides methods for creating and managing token factories for different
 * asset types supported by the SettleMint platform.
 *
 * The factory namespace handles:
 * - Creation of token factories (bond, equity, fund, stablecoin, deposit)
 * - Batch creation of multiple factories
 * - Transaction tracking and status updates
 *
 * @example
 * ```typescript
 * // Access via oRPC client
 * const result = await client.tokens.factory.create({
 *   factories: { type: "bond", name: "Bond Factory" }
 * });
 * ```
 */

import { baseContract } from "@/orpc/procedures/base.contract";
import { eventIterator } from "@orpc/server";
import {
  FactoryCreateOutputSchema,
  FactoryCreateSchema,
} from "./routes/factory.create.schema";

const factoryCreate = baseContract
  .route({
    method: "POST",
    path: "/tokens/factory",
    description: "Create a new token factory",
    successDescription: "New token factory created",
    tags: ["tokens"],
  })
  .input(FactoryCreateSchema)
  .output(eventIterator(FactoryCreateOutputSchema));

/**
 * Tokens contract type definition
 *
 * Defines the structure and schemas for token-related operations
 * within the oRPC framework.
 */
export const tokensContract = {
  factoryCreate,
};

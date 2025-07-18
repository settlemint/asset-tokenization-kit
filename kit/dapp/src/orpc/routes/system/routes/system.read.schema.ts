/**
 * Schema for System Read Operations
 *
 * This schema defines the structure for reading system contract details
 * including associated token factories. It provides access to the system's
 * configuration and deployed token factories.
 * @example
 * ```typescript
 * const system = await client.system.read({
 *   id: "0x1234..."
 * });
 *
 * // Access token factories
 * system.tokenFactories.forEach(factory => {
 *   console.log(factory.name, factory.typeId);
 * });
 * ```
 */

import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { z } from "zod";

/**
 * Input schema for system read operations
 */
export const SystemReadSchema = z.object({
  /**
   * The system contract address to query
   */
  id: z.union([
    ethereumAddress.describe("The system contract address"),
    z.literal("default").describe("The system used by the dApp"),
  ]),
});

/**
 * Token factory information schema
 */
const TokenFactorySchema = z.object({
  /**
   * The factory contract address
   */
  id: ethereumAddress,

  /**
   * The name of the token factory
   */
  name: z.string(),

  /**
   * The type identifier of the factory (bond, equity, fund, etc.)
   */
  typeId: z.string(),
});

/**
 * Output schema for system read operations
 */
export const SystemReadOutputSchema = z.object({
  /**
   * The system contract address
   */
  id: ethereumAddress,

  /**
   * The deployment transaction hash
   */
  deployedInTransaction: z.string().nullable(),

  /**
   * The identity registry contract address
   */
  identityRegistry: ethereumAddress.nullable(),

  /**
   * The trusted issuers registry contract address
   */
  trustedIssuersRegistry: ethereumAddress.nullable(),

  /**
   * The compliance engine contract address
   */
  compliance: ethereumAddress.nullable(),

  /**
   * The token factory registry contract address
   */
  tokenFactoryRegistry: ethereumAddress.nullable(),

  /**
   * The system addon registry contract address
   */
  systemAddonRegistry: ethereumAddress.nullable(),

  /**
   * List of token factories deployed by this system
   */
  tokenFactories: z.array(TokenFactorySchema),
});

// Type exports
export type SystemReadInput = z.infer<typeof SystemReadSchema>;
export type SystemReadOutput = z.infer<typeof SystemReadOutputSchema>;
export type TokenFactory = z.infer<typeof TokenFactorySchema>;

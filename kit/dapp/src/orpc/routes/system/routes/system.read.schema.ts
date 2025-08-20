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

import { ethereumAddress } from "@atk/zod/ethereum-address";
import { z } from "zod";

/**
 * Input schema for system read operations
 */
export const SystemReadSchema = z.object({
  /**
   * The system contract address to query
   */
  id: z.union([
    z.literal("default").describe("The system used by the dApp"),
    ethereumAddress.describe("The system contract address"),
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
 * System addon information schema
 */
const SystemAddonSchema = z.object({
  /**
   * The addon contract address
   */
  id: ethereumAddress,

  /**
   * The name of the addon
   */
  name: z.string(),

  /**
   * The type identifier of the addon
   */
  typeId: z.string(),
});

/**
 * Compliance module information schema
 */
const ComplianceModuleSchema = z.object({
  /**
   * The compliance module contract address
   */
  id: ethereumAddress,

  /**
   * The name of the compliance module
   */
  name: z.string(),

  /**
   * The type identifier of the compliance module
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
   * The identity factory contract address
   */
  identityFactory: ethereumAddress.nullable(),

  /**
   * The trusted issuers registry contract address
   */
  trustedIssuersRegistry: ethereumAddress.nullable(),

  /**
   * The compliance module registry contract address
   */
  complianceModuleRegistry: ethereumAddress.nullable(),

  /**
   * The token factory registry contract address
   */
  tokenFactoryRegistry: ethereumAddress.nullable(),

  /**
   * The system addon registry contract address
   */
  systemAddonRegistry: ethereumAddress.nullable(),

  /**
   * The system access manager contract address
   */
  systemAccessManager: ethereumAddress.nullable(),

  /**
   * List of token factories deployed by this system
   */
  tokenFactories: z.array(TokenFactorySchema),

  /**
   * List of system addons deployed by this system
   */
  systemAddons: z.array(SystemAddonSchema),

  /**
   * List of compliance modules deployed by this system
   */
  complianceModules: z.array(ComplianceModuleSchema),
});

// Type exports
export type SystemReadInput = z.infer<typeof SystemReadSchema>;
export type SystemReadOutput = z.infer<typeof SystemReadOutputSchema>;
export type TokenFactory = z.infer<typeof TokenFactorySchema>;

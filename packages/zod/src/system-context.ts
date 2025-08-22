/**
 * System Context Validation Utilities
 *
 * This module provides comprehensive Zod schemas for validating system context data
 * from TheGraph, ensuring type safety for system components, token factories,
 * compliance modules, and system addons.
 * @module SystemContextValidation
 */

import { z } from "zod";
import { accessControlSchema } from "./access-control-roles";
import { addonFactoryTypeId } from "./addon-types";
import { assetFactoryTypeId } from "./asset-types";
import { complianceTypeId } from "./compliance";
import { ethereumAddress } from "./ethereum-address";


/**
 * Schema for token factory entries
 */
const tokenFactorySchema = z.object({
  id: ethereumAddress,
  name: z.string(),
  typeId: assetFactoryTypeId(),
});

/**
 * Schema for system addon entries
 */
const systemAddonSchema = z.object({
  id: ethereumAddress,
  name: z.string(),
  typeId: addonFactoryTypeId(),
});

/**
 * Schema for compliance module entries
 */
const complianceModuleSchema = z.object({
  id: ethereumAddress,
  typeId: complianceTypeId(),
  name: z.string(),
});

/**
 * Creates a Zod schema that validates the system context from TheGraph.
 * @remarks
 * This schema validates the complete system structure including:
 * - System address and deployment transaction
 * - Token factory registry with factories
 * - System addon registry with addons
 * - Compliance module registry with modules
 * - System access manager with access controls
 * - Identity-related components (factory, registry, storage)
 * - Trusted issuers and topic scheme registries
 * @returns A Zod object schema for system context validation
 * @example
 * ```typescript
 * const schema = systemContextSchema();
 * const result = schema.parse({
 *   system: {
 *     id: "0x123...",
 *     deployedInTransaction: "0xabc...",
 *     tokenFactoryRegistry: {
 *       id: "0x456...",
 *       tokenFactories: [
 *         {
 *           id: "0x789...",
 *           name: "Bond Factory",
 *           typeId: "ATKBondFactory"
 *         }
 *       ]
 *     },
 *     // ... other fields
 *   }
 * });
 * ```
 */
export const systemContextSchema = () =>
  z.object({
    system: z.object({
      id: ethereumAddress.describe("System address"),
      deployedInTransaction: z.string().describe("Transaction hash where system was deployed"),
      tokenFactoryRegistry: z.object({
        id: ethereumAddress.describe("Token factory registry address"),
        tokenFactories: z
          .array(tokenFactorySchema)
          .describe("Array of registered token factories"),
      }),
      systemAddonRegistry: z.object({
        id: ethereumAddress.describe("System addon registry address"),
        systemAddons: z
          .array(systemAddonSchema)
          .describe("Array of registered system addons"),
      }),
      complianceModuleRegistry: z.object({
        id: ethereumAddress.describe("Compliance module registry address"),
        complianceModules: z
          .array(complianceModuleSchema)
          .describe("Array of registered compliance modules"),
      }),
      systemAccessManager: z.object({
        id: ethereumAddress.describe("System access manager address"),
        accessControl: accessControlSchema().describe("Access control configuration"),
      }),
      identityFactory: z.object({
        id: ethereumAddress.describe("Identity factory address"),
      }),
      identityRegistryStorage: z.object({
        id: ethereumAddress.describe("Identity registry storage address"),
      }),
      identityRegistry: z.object({
        id: ethereumAddress.describe("Identity registry address"),
      }),
      trustedIssuersRegistry: z.object({
        id: ethereumAddress.describe("Trusted issuers registry address"),
      }),
      topicSchemeRegistry: z.object({
        id: ethereumAddress.describe("Topic scheme registry address"),
      }),
    }),
  });

/**
 * Type inference for the system context schema
 */
export type SystemContext = z.infer<ReturnType<typeof systemContextSchema>>;

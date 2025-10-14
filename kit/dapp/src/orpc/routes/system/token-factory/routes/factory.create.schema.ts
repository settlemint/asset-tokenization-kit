/**
 * Schema for Token Factory Creation Operations
 *
 * This schema handles the creation of token factories for different asset types
 * (bond, equity, fund, stablecoin, deposit). It supports both single factory
 * creation and batch creation of multiple factories.
 *
 * Each token type requires specific implementation addresses which are set
 * as defaults based on the SettleMint deployment configuration.
 * @example
 * ```typescript
 * // Create a single bond factory
 * const input = {
 *   factories: {
 *     type: "bond",
 *     name: "Bond Token Factory"
 *   }
 * };
 *
 * // Create multiple factories
 * const input = {
 *   factories: [
 *     { type: "bond", name: "Bond Token Factory" },
 *     { type: "equity", name: "Equity Token Factory" }
 *   ]
 * };
 * ```
 */

import { ethereumAddress } from "@atk/zod/ethereum-address";
import * as z from "zod";
import { MutationInputSchema } from "../../../common/schemas/mutation.schema";

/**
 * Token types supported for factory creation
 */
export const TokenTypeEnum = z.enum([
  "bond",
  "equity",
  "fund",
  "stablecoin",
  "deposit",
]);

export type TokenType = z.infer<typeof TokenTypeEnum>;

/**
 * Default implementation addresses from SettleMint deployment
 * These addresses are deterministic and consistent across deployments
 */
const DEFAULT_IMPLEMENTATIONS = {
  bond: {
    factoryImplementation: "0x5e771e1417100000000000000000000000020021",
    tokenImplementation: "0x5e771e1417100000000000000000000000020020",
  },
  equity: {
    factoryImplementation: "0x5e771e1417100000000000000000000000020025",
    tokenImplementation: "0x5e771e1417100000000000000000000000020024",
  },
  fund: {
    factoryImplementation: "0x5e771e1417100000000000000000000000020027",
    tokenImplementation: "0x5e771e1417100000000000000000000000020026",
  },
  stablecoin: {
    factoryImplementation: "0x5e771e1417100000000000000000000000020029",
    tokenImplementation: "0x5e771e1417100000000000000000000000020028",
  },
  deposit: {
    factoryImplementation: "0x5e771e1417100000000000000000000000020023",
    tokenImplementation: "0x5e771e1417100000000000000000000000020022",
  },
} as const;

/**
 * Schema for a single factory creation
 */
const SingleFactorySchema = z.object({
  /**
   * The type of token factory to create
   */
  type: TokenTypeEnum.describe("The type of token factory to create"),

  /**
   * The name for the token factory
   */
  name: z.string().min(1).max(100).describe("The name for the token factory"),

  /**
   * Optional custom factory implementation address
   * If not provided, uses the default for the token type
   */
  factoryImplementation: ethereumAddress
    .optional()
    .describe("Custom factory implementation address"),

  /**
   * Optional custom token implementation address
   * If not provided, uses the default for the token type
   */
  tokenImplementation: ethereumAddress
    .optional()
    .describe("Custom token implementation address"),
});

/**
 * Main schema for factory creation
 * Supports both single factory and batch creation
 */
export const FactoryCreateSchema = MutationInputSchema.extend({
  /**
   * Factory or factories to create
   * Can be a single factory object or an array of factories
   */
  factories: z
    .array(SingleFactorySchema)
    .min(1)
    .max(10)
    .describe("Factory or factories to create"),
});

// Type exports using Zod's type inference
// These provide compile-time TypeScript types derived from runtime schemas
// ensuring perfect alignment between validation and type checking
export type FactoryCreateInput = z.input<typeof FactoryCreateSchema>;
export type SingleFactory = z.infer<typeof SingleFactorySchema>;

/**
 * Helper function to get default implementations for a token type
 *
 * TypeScript benefits:
 * - Const assertion on DEFAULT_IMPLEMENTATIONS ensures literal types
 * - TokenType union ensures only valid token types are accepted
 * - Return type is automatically inferred from the const object
 * @param type
 */
export function getDefaultImplementations(type: TokenType) {
  return DEFAULT_IMPLEMENTATIONS[type];
}

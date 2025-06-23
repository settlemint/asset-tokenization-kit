/**
 * Schema for Token Factory Creation Operations
 *
 * This schema handles the creation of token factories for different asset types
 * (bond, equity, fund, stablecoin, deposit). It supports both single factory
 * creation and batch creation of multiple factories.
 *
 * Each token type requires specific implementation addresses which are set
 * as defaults based on the SettleMint deployment configuration.
 *
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

import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { z } from "zod/v4";
import { CreateSchema } from "../../common/schemas/create.schema";
import { TransactionTrackingMessagesSchema } from "../../common/schemas/transaction-messages.schema";

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
 * Combined messages schema for factory creation
 * Extends common transaction tracking messages with factory-specific messages
 *
 * TypeScript improvements:
 * - Each message field has proper type inference from Zod schema
 * - Optional fields with default values ensure type safety without requiring all messages
 * - The schema extension pattern preserves base message types while adding specific ones
 */
export const FactoryCreateMessagesSchema =
  TransactionTrackingMessagesSchema.extend({
    factoryCreated: z
      .string()
      .optional()
      .default("Token factory successfully created."),
    creatingFactory: z.string().optional().default("Creating token factory..."),
    factoryCreationFailed: z
      .string()
      .optional()
      .default("Failed to create token factory. Please try again."),
    batchProgress: z
      .string()
      .optional()
      .default("Creating factory {{current}} of {{total}}..."),
    batchCompleted: z
      .string()
      .optional()
      .default("Successfully created {{count}} token factories."),
    // Messages used by useStreamingMutation hook for proper event handling
    // These messages align with the streaming mutation's event status types
    initialLoading: z
      .string()
      .optional()
      .default("Preparing to create token factories..."),
    noResultError: z
      .string()
      .optional()
      .default("No factory address received from transaction."),
    defaultError: z
      .string()
      .optional()
      .default("Failed to create token factory."),
    systemNotBootstrapped: z
      .string()
      .optional()
      .default(
        "System needs to be bootstrapped first. Please wait for system initialization to complete."
      ),
    transactionSubmitted: z
      .string()
      .optional()
      .default("Transaction submitted. Waiting for confirmation..."),
    factoryCreationCompleted: z
      .string()
      .optional()
      .default("Factory creation completed."),
    allFactoriesSucceeded: z
      .string()
      .optional()
      .default("All {{count}} factories created successfully."),
    someFactoriesFailed: z
      .string()
      .optional()
      .default("{{success}} factories created, {{failed}} failed."),
    allFactoriesFailed: z
      .string()
      .optional()
      .default("All {{count}} factories failed to create."),
    factoryAlreadyExists: z
      .string()
      .optional()
      .default("{{name}} factory already exists, skipping..."),
    allFactoriesSkipped: z
      .string()
      .optional()
      .default("All {{count}} factories already exist."),
    someFactoriesSkipped: z
      .string()
      .optional()
      .default(
        "{{success}} factories created, {{skipped}} skipped, {{failed}} failed."
      ),
  });

/**
 * Main schema for factory creation
 * Supports both single factory and batch creation
 */
export const FactoryCreateSchema = CreateSchema.extend({
  /**
   * The system contract address to use for creating factories
   * Defaults to the standard SettleMint system contract
   */
  contract: ethereumAddress
    .describe("The system contract address")
    .default("0x5e771e1417100000000000000000000000020088"),

  /**
   * Factory or factories to create
   * Can be a single factory object or an array of factories
   */
  factories: z
    .union([SingleFactorySchema, z.array(SingleFactorySchema).min(1).max(10)])
    .describe("Factory or factories to create"),

  /**
   * Optional custom messages for the operation
   * If not provided, default English messages will be used
   */
  messages: FactoryCreateMessagesSchema.optional(),
});

/**
 * Schema for individual factory result in streaming output
 */
const FactoryResultSchema = z.object({
  type: TokenTypeEnum,
  name: z.string(),
  transactionHash: z.string().optional(),
  error: z.string().optional(),
});

/**
 * Output schema for streaming events
 *
 * TypeScript features:
 * - Discriminated union via status enum for type-safe event handling
 * - Optional fields allow progressive enhancement of event data
 * - The 'result' field provides compatibility with useStreamingMutation hook's ExtractResultType
 */
export const FactoryCreateOutputSchema = z.object({
  status: z.enum(["pending", "confirmed", "failed", "completed"]),
  message: z.string(),
  currentFactory: FactoryResultSchema.optional(),
  results: z.array(FactoryResultSchema).optional(),
  result: z.array(FactoryResultSchema).optional(), // Added for useStreamingMutation hook type extraction compatibility
  progress: z
    .object({
      current: z.number(),
      total: z.number(),
    })
    .optional(),
});

// Type exports using Zod's type inference
// These provide compile-time TypeScript types derived from runtime schemas
// ensuring perfect alignment between validation and type checking
export type FactoryCreateInput = z.infer<typeof FactoryCreateSchema>;
export type FactoryCreateMessages = z.infer<typeof FactoryCreateMessagesSchema>;
export type FactoryCreateOutput = z.infer<typeof FactoryCreateOutputSchema>;
export type SingleFactory = z.infer<typeof SingleFactorySchema>;

/**
 * Helper function to get default implementations for a token type
 *
 * TypeScript benefits:
 * - Const assertion on DEFAULT_IMPLEMENTATIONS ensures literal types
 * - TokenType union ensures only valid token types are accepted
 * - Return type is automatically inferred from the const object
 */
export function getDefaultImplementations(type: TokenType) {
  return DEFAULT_IMPLEMENTATIONS[type];
}

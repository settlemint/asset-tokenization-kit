import { z } from "zod/v4";
import { MutationInputSchemaWithContract } from "../../common/schemas/mutation.schema";
import { TransactionTrackingMessagesSchema } from "../../common/schemas/transaction-messages.schema";

/**
 * Supported system addon types enum
 */
export const SystemAddonTypeEnum = z.enum(["airdrops", "yield", "xvp"]);

/**
 * System addon type
 */
export type SystemAddonType = z.infer<typeof SystemAddonTypeEnum>;

/**
 * Default implementation addresses for each addon type
 */
const DEFAULT_ADDON_IMPLEMENTATIONS = {
  airdrops: {
    pushAirdropFactory: "0x5e771e1417100000000000000000000000020034",
    vestingAirdropFactory: "0x5e771e1417100000000000000000000000020033",
  },
  yield: {
    fixedYieldScheduleFactory: "0x5e771e1417100000000000000000000000020030",
  },
  xvp: {
    xvpSettlementFactory: "0x5e771e1417100000000000000000000000020032",
  },
} as const;

/**
 * Get default implementation addresses for an addon type
 */
export function getDefaultAddonImplementations(type: SystemAddonType) {
  return DEFAULT_ADDON_IMPLEMENTATIONS[type];
}

/**
 * Individual addon configuration schema
 */
const SystemAddonConfigSchema = z.object({
  type: SystemAddonTypeEnum,
  name: z.string().min(1).max(50),
  // Optional implementation addresses for custom deployments
  implementations: z
    .record(z.string(), z.string().regex(/^0x[a-fA-F0-9]{40}$/))
    .optional(),
});

/**
 * System addon create messages schema for localization
 */
export const SystemAddonCreateMessagesSchema =
  TransactionTrackingMessagesSchema.extend({
    initialLoading: z
      .string()
      .default("Preparing to register system add-ons..."),
    addonRegistered: z.string().default("Add-on registered successfully"),
    registeringAddon: z.string().default("Registering add-on..."),
    addonRegistrationFailed: z.string().default("Add-on registration failed"),
    batchProgress: z
      .string()
      .default("Registering add-on {{current}} of {{total}}..."),
    batchCompleted: z.string().default("All add-ons registered successfully"),
    noResultError: z.string().default("No registration result received"),
    defaultError: z.string().default("Add-on registration failed"),
    systemNotBootstrapped: z
      .string()
      .default("System not properly bootstrapped"),
    addonAlreadyExists: z
      .string()
      .default("Add-on {{name}} already registered"),
    allAddonsSucceeded: z
      .string()
      .default("All {{count}} add-ons registered successfully"),
    someAddonsFailed: z
      .string()
      .default(
        "{{successCount}} of {{totalCount}} add-ons registered successfully"
      ),
    allAddonsFailed: z.string().default("All add-on registrations failed"),
    allAddonsSkipped: z.string().default("All add-ons were already registered"),
    someAddonsSkipped: z
      .string()
      .default(
        "{{successCount}} new add-ons registered, {{skippedCount}} already existed"
      ),
  });

/**
 * Input schema for system addon creation
 */
export const SystemAddonCreateSchema = MutationInputSchemaWithContract.extend({
  addons: z.union([SystemAddonConfigSchema, z.array(SystemAddonConfigSchema)]),
  messages: SystemAddonCreateMessagesSchema.optional(),
});

/**
 * Schema for individual addon result in streaming output
 */
const AddonResultSchema = z.object({
  type: SystemAddonTypeEnum,
  name: z.string(),
  proxyAddress: z.string().optional(),
  transactionHash: z.string().optional(),
  error: z.string().optional(),
  implementations: z.record(z.string(), z.string()).optional(),
});

/**
 * Output schema for streaming events during addon registration
 */
export const SystemAddonCreateOutputSchema = z.object({
  status: z.enum(["pending", "confirmed", "failed", "completed"]),
  message: z.string(),
  currentAddon: AddonResultSchema.optional(),
  results: z.array(AddonResultSchema).optional(),
  result: z.array(AddonResultSchema).optional(), // For useStreamingMutation compatibility
  progress: z
    .object({
      current: z.number(),
      total: z.number(),
    })
    .optional(),
});

/**
 * Type definitions
 */
export type SystemAddonCreateInput = z.infer<typeof SystemAddonCreateSchema>;
export type SystemAddonCreateOutput = z.infer<
  typeof SystemAddonCreateOutputSchema
>;
export type SystemAddonConfig = z.infer<typeof SystemAddonConfigSchema>;
export type AddonResult = z.infer<typeof AddonResultSchema>;

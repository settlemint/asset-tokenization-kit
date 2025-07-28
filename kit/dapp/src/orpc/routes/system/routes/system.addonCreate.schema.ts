import { addonType, type AddonType } from "@/lib/zod/validators/addon-types";
import { z } from "zod";
import { MutationInputSchemaWithContract } from "../../common/schemas/mutation.schema";

/**
 * Re-export addon type from validators for backward compatibility
 */
export const SystemAddonTypeEnum = addonType();
export type SystemAddonType = AddonType;

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
  type: addonType(),
  name: z.string().min(1).max(50),
  // Optional implementation addresses for custom deployments
  implementations: z
    .record(z.string(), z.string().regex(/^0x[a-fA-F0-9]{40}$/))
    .optional(),
});

/**
 * Input schema for system addon creation
 */
export const SystemAddonCreateSchema = MutationInputSchemaWithContract.extend({
  addons: z.union([SystemAddonConfigSchema, z.array(SystemAddonConfigSchema)]),
});

/**
 * Schema for individual addon result in streaming output
 */
const AddonResultSchema = z.object({
  type: addonType(),
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

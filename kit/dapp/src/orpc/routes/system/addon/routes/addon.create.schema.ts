import { MutationInputSchema } from "@/orpc/routes/common/schemas/mutation.schema";
import { type AddonType, addonType } from "@atk/zod/addon-types";
import * as z from "zod";

/**
 * Type alias for clarity in system context
 */
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
export const SystemAddonCreateSchema = MutationInputSchema.extend({
  addons: z.array(SystemAddonConfigSchema).min(1),
});

/**
 * Type definitions
 */
export type SystemAddonCreateInput = z.input<typeof SystemAddonCreateSchema>;
export type SystemAddonConfig = z.infer<typeof SystemAddonConfigSchema>;

import { assetType } from "@atk/zod/asset-types";
import { bigDecimal } from "@atk/zod/bigdecimal";
import { z } from "zod";

/**
 * Input schema for system assets endpoint
 */
export const StatsAssetsInputSchema = z.object({}).strict();

/**
 * Output schema for system assets endpoint
 */
export const StatsAssetsOutputSchema = z.object({
  totalAssets: z.number().int().min(0),
  assetBreakdown: z.record(assetType(), z.number().int().min(0)),
  totalValue: bigDecimal(),
  valueBreakdown: z.record(assetType(), bigDecimal()),
  tokensCreatedCount: z.number().int(),
  tokensLaunchedCount: z.number().int(),
  pendingLaunchesCount: z.number().int(),
});

export type StatsAssetsInput = z.infer<typeof StatsAssetsInputSchema>;
export type StatsAssetsOutput = z.infer<typeof StatsAssetsOutputSchema>;

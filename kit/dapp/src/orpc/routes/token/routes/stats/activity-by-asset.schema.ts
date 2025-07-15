import { z } from "zod";

/**
 * Input schema for activity by asset endpoint
 */
export const TokenStatsActivityByAssetInputSchema = z.object({}).strict();

/**
 * Output schema for activity by asset endpoint
 */
export const TokenStatsActivityByAssetOutputSchema = z.object({
  assetActivity: z.array(
    z.object({
      assetType: z.string(),
      mint: z.number().int().min(0),
      transfer: z.number().int().min(0),
      burn: z.number().int().min(0),
      clawback: z.number().int().min(0),
    })
  ),
});

export type TokenStatsActivityByAssetInput = z.infer<
  typeof TokenStatsActivityByAssetInputSchema
>;
export type TokenStatsActivityByAssetOutput = z.infer<
  typeof TokenStatsActivityByAssetOutputSchema
>;

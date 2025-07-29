import { z } from "zod";

/**
 * Input schema for system assets endpoint
 */
export const TokenStatsSystemAssetsInputSchema = z.object({}).strict();

/**
 * Output schema for system assets endpoint
 */
export const TokenStatsSystemAssetsOutputSchema = z.object({
  totalAssets: z.number().int().min(0),
  assetBreakdown: z.record(z.string(), z.number().int().min(0)),
});

export type TokenStatsSystemAssetsInput = z.infer<
  typeof TokenStatsSystemAssetsInputSchema
>;
export type TokenStatsSystemAssetsOutput = z.infer<
  typeof TokenStatsSystemAssetsOutputSchema
>;

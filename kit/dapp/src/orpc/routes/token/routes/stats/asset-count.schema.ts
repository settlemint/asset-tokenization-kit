import { z } from "zod";

/**
 * Input schema for asset count endpoint
 */
export const TokenStatsAssetCountInputSchema = z.object({}).strict();

/**
 * Output schema for asset count endpoint
 */
export const TokenStatsAssetCountOutputSchema = z.object({
  totalAssets: z.number().int().min(0),
  assetBreakdown: z.record(z.string(), z.number().int().min(0)),
});

export type TokenStatsAssetCountInput = z.infer<
  typeof TokenStatsAssetCountInputSchema
>;
export type TokenStatsAssetCountOutput = z.infer<
  typeof TokenStatsAssetCountOutputSchema
>;

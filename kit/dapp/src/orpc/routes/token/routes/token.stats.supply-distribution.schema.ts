import { z } from "zod";

/**
 * Input schema for supply distribution endpoint
 */
export const TokenStatsSupplyDistributionInputSchema = z.object({}).strict();

/**
 * Output schema for supply distribution endpoint
 */
export const TokenStatsSupplyDistributionOutputSchema = z.object({
  supplyDistribution: z.array(
    z.object({
      assetType: z.string(),
      totalSupply: z.string(),
    })
  ),
});

export type TokenStatsSupplyDistributionInput = z.infer<
  typeof TokenStatsSupplyDistributionInputSchema
>;
export type TokenStatsSupplyDistributionOutput = z.infer<
  typeof TokenStatsSupplyDistributionOutputSchema
>;

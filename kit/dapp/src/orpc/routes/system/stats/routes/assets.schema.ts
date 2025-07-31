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
  assetBreakdown: z.record(z.string(), z.number().int().min(0)),
});

export type StatsAssetsInput = z.infer<typeof StatsAssetsInputSchema>;
export type StatsAssetsOutput = z.infer<typeof StatsAssetsOutputSchema>;

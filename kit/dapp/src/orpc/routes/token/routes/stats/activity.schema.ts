import { z } from "zod";

/**
 * Input schema for activity endpoints (both system and asset-specific)
 */
export const ActivityInputSchema = z
  .object({
    timeRange: z
      .number()
      .int()
      .min(1)
      .max(365)
      .default(30)
      .optional()
      .describe(
        "Number of days to look back for activity data (only for asset-specific)"
      ),
  })
  .strict();

/**
 * Output schema for system-wide activity by asset type
 */
export const SystemActivityOutputSchema = z.object({
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

/**
 * Output schema for asset-specific activity
 */
export const AssetActivityOutputSchema = z.object({
  tokenId: z.string(),
  timeRangeDays: z.number().int().min(1),
  activityHistory: z.array(
    z.object({
      timestamp: z.string(),
      mints: z.number().int().min(0),
      burns: z.number().int().min(0),
      transfers: z.number().int().min(0),
    })
  ),
});

/**
 * Combined output schema for activity endpoints
 */
export const ActivityOutputSchema = z.union([
  SystemActivityOutputSchema,
  AssetActivityOutputSchema,
]);

export type ActivityInput = z.infer<typeof ActivityInputSchema>;
export type SystemActivityOutput = z.infer<typeof SystemActivityOutputSchema>;
export type AssetActivityOutput = z.infer<typeof AssetActivityOutputSchema>;
export type ActivityOutput = z.infer<typeof ActivityOutputSchema>;

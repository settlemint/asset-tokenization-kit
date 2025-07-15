import { z } from "zod";

/**
 * Input schema for growth over time endpoint
 */
export const UserStatsGrowthOverTimeInputSchema = z.object({
  timeRange: z.number().int().min(1).max(365).default(30),
});

/**
 * Output schema for growth over time endpoint
 */
export const UserStatsGrowthOverTimeOutputSchema = z.object({
  userGrowth: z.array(
    z.object({
      timestamp: z.string(),
      users: z.number().int().min(0),
    })
  ),
  timeRangeDays: z.number().int().min(1).max(365),
});

export type UserStatsGrowthOverTimeInput = z.infer<
  typeof UserStatsGrowthOverTimeInputSchema
>;
export type UserStatsGrowthOverTimeOutput = z.infer<
  typeof UserStatsGrowthOverTimeOutputSchema
>;

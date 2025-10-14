import * as z from "zod";

/**
 * Input schema for user count endpoint
 */
export const UserStatsUserCountInputSchema = z.object({
  timeRange: z.number().int().min(1).max(365).default(7),
});

/**
 * Output schema for user count endpoint
 */
export const UserStatsUserCountOutputSchema = z.object({
  totalUsers: z.number().int().min(0),
  recentUsers: z.number().int().min(0),
  timeRangeDays: z.number().int().min(1).max(365),
});

export type UserStatsUserCountInput = z.infer<
  typeof UserStatsUserCountInputSchema
>;
export type UserStatsUserCountOutput = z.infer<
  typeof UserStatsUserCountOutputSchema
>;

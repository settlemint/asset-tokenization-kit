import * as z from "zod";

/**
 * Schema for user statistics input parameters
 */
export const UserStatsInputSchema = z.object({
  /** Time range in days for historical data (default: 7 days) */
  timeRange: z.number().min(1).max(365).optional().default(7),
});

/**
 * Schema for user statistics output
 * Contains user-related metrics including totals and growth over time
 */
export const UserStatsOutputSchema = z.object({
  /** Total number of active users (users who hold or have held tokens) */
  totalUsers: z.number(),

  /** Number of users active in the specified time range */
  recentUsers: z.number(),

  /** User growth data over time for charting */
  userGrowth: z.array(
    z.object({
      /** ISO timestamp for this data point */
      timestamp: z.string(),

      /** Cumulative number of users at this point in time */
      users: z.number(),
    })
  ),

  /** The time range in days that was used for recent calculations */
  timeRangeDays: z.number(),
});

/**
 * Type definition for user statistics input
 */
export type UserStatsInput = z.infer<typeof UserStatsInputSchema>;

/**
 * Type definition for user statistics output
 */
export type UserStats = z.infer<typeof UserStatsOutputSchema>;

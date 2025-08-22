import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { systemRouter } from "@/orpc/procedures/system.router";
import { z } from "zod";

/**
 * GraphQL query to fetch user-related metrics
 * Combines total user count with time-series data for growth tracking
 */
const USER_METRICS_QUERY = theGraphGraphql(`
  query UserMetrics($since: Timestamp!) {
    # Total active users (users who hold or have held tokens)
    accountStatsStates {
      account {
        id
      }
    }
    
    # User growth over time - get account activity since specified date
    userGrowth: accountStats_collection(
      where: {
        timestamp_gte: $since
        account_: { isContract: false }
      }
      interval: day
      orderBy: timestamp
      orderDirection: asc
    ) {
      timestamp
      account {
        id
      }
    }
    
    # Recent active users - users with recent activity
    recentActiveUsers: accountStats_collection(
      where: {
        timestamp_gte: $since
        account_: { isContract: false }
      }
      interval: day
    ) {
      account {
        id
      }
    }
  }
`);

// Schema for the GraphQL response
const UserMetricsResponseSchema = z.object({
  accountStatsStates: z.array(
    z.object({
      account: z.object({
        id: z.string(),
      }),
    })
  ),
  userGrowth: z.array(
    z.object({
      timestamp: z.string(),
      account: z.object({
        id: z.string(),
      }),
    })
  ),
  recentActiveUsers: z.array(
    z.object({
      account: z.object({
        id: z.string(),
      }),
    })
  ),
});

/**
 * Helper function to process account stats into cumulative user growth data
 * Tracks unique users over time to show growth trends
 */
function processUserGrowthData(
  accountStats: { timestamp: string; account: { id: string } }[]
): { timestamp: string; users: number }[] {
  // Group accounts by day and track unique users
  const dailyUserSets = new Map<string, Set<string>>();

  for (const stat of accountStats) {
    // Safely extract date part, handle potential null/undefined values
    const timestampParts = stat.timestamp.split("T");
    const dayKey = timestampParts[0] ?? "unknown";

    if (!dailyUserSets.has(dayKey)) {
      dailyUserSets.set(dayKey, new Set());
    }

    const dayUserSet = dailyUserSets.get(dayKey);
    if (dayUserSet) {
      dayUserSet.add(stat.account.id);
    }
  }

  // Convert to cumulative user growth
  const sortedDays = [...dailyUserSets.keys()].sort();
  const allUsers = new Set<string>();
  const result: { timestamp: string; users: number }[] = [];

  for (const day of sortedDays) {
    const dayUsers = dailyUserSets.get(day);
    if (!dayUsers) continue;

    // Add new users to the cumulative set
    dayUsers.forEach((userId) => {
      allUsers.add(userId);
    });

    result.push({
      timestamp: `${day}T00:00:00.000Z`, // Convert back to ISO format
      users: allUsers.size, // Cumulative count
    });
  }

  return result;
}

/**
 * Helper function to count unique recent users from account stats
 */
function countUniqueRecentUsers(
  recentUsers: { account: { id: string } }[]
): number {
  const uniqueUsers = new Set<string>();

  for (const user of recentUsers) {
    uniqueUsers.add(user.account.id);
  }

  return uniqueUsers.size;
}

/**
 * User statistics route handler.
 *
 * Fetches comprehensive user-related metrics including:
 * - Total number of active users (users who hold or have held tokens)
 * - Number of recently active users in the specified time range
 * - User growth data over time for charting
 *
 * This endpoint is optimized for dashboard user widgets and growth charts.
 *
 * Authentication: Required
 * Method: GET /user/stats
 *
 * @param input.timeRange - Number of days to look back for recent activity (default: 7)
 * @returns Promise<UserMetrics> - Comprehensive user metrics
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get user metrics for the last 30 days
 * const metrics = await orpc.user.stats.query({ input: { timeRange: 30 } });
 * console.log(metrics.totalUsers, metrics.userGrowth);
 * ```
 */
export const stats = systemRouter.user.stats.handler(
  async ({ context, input }) => {
    // System context is guaranteed by systemMiddleware

    // timeRange is guaranteed to have a value from the schema default
    const timeRange = input.timeRange;

    // Calculate the date range for queries
    const since = new Date();
    since.setDate(since.getDate() - timeRange);
    const sinceTimestamp = Math.floor(since.getTime() / 1000); // Convert to Unix timestamp

    // Fetch all user-related data in a single query
    const response = await context.theGraphClient.query(USER_METRICS_QUERY, {
      input: {
        since: sinceTimestamp.toString(),
      },
      output: UserMetricsResponseSchema,
    });

    // Calculate metrics
    const totalUsers = response.accountStatsStates.length;
    const recentUsers = countUniqueRecentUsers(response.recentActiveUsers);
    const userGrowth = processUserGrowthData(response.userGrowth);

    return {
      totalUsers,
      recentUsers,
      userGrowth,
      timeRangeDays: timeRange,
    };
  }
);

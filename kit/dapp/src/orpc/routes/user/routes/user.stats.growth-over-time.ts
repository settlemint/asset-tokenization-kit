import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { systemRouter } from "@/orpc/procedures/system.router";
import * as z from "zod";

/**
 * GraphQL query to fetch user growth data for time-series charts
 * Optimized for the User Growth Chart specifically
 */
const GROWTH_OVER_TIME_QUERY = theGraphGraphql(`
  query GrowthOverTime($since: Timestamp!) {
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
  }
`);

// Schema for the GraphQL response
const GrowthOverTimeResponseSchema = z.object({
  userGrowth: z.array(
    z.object({
      timestamp: z.string(),
      account: z.object({
        id: z.string(),
      }),
    })
  ),
});

/**
 * Helper function to process account stats into cumulative user growth data
 * Tracks unique users over time to show growth trends for charts
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
  const sortedDays = [...dailyUserSets.keys()].toSorted();
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
 * Growth over time route handler.
 *
 * Fetches user growth data specifically for the User Growth Chart.
 * Returns time-series data of cumulative user growth for area chart visualization.
 *
 * This endpoint is optimized for charts showing user growth trends over time.
 *
 * Authentication: Required
 * Method: GET /user/stats/growth-over-time
 *
 * @param input.timeRange - Number of days to look back for growth data (default: 30)
 * @returns Promise<GrowthOverTimeMetrics> - User growth time-series data
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get user growth for the last 60 days
 * const growth = await orpc.user.statsGrowthOverTime.query({ input: { timeRange: 60 } });
 * console.log('Growth:', growth.userGrowth);
 * ```
 */
export const statsGrowthOverTime =
  systemRouter.user.statsGrowthOverTime.handler(async ({ context, input }) => {
    // System context is guaranteed by systemMiddleware

    // timeRange is guaranteed to have a value from the schema default
    const timeRange = input.timeRange;

    // Calculate the date range for queries
    const since = new Date();
    since.setDate(since.getDate() - timeRange);
    const sinceTimestamp = Math.floor(since.getTime() / 1000); // Convert to Unix timestamp

    // Fetch user growth data
    const response = await context.theGraphClient.query(
      GROWTH_OVER_TIME_QUERY,
      {
        input: {
          since: sinceTimestamp.toString(),
        },
        output: GrowthOverTimeResponseSchema,
      }
    );

    // Process the user growth data
    const userGrowth = processUserGrowthData(response.userGrowth);

    return {
      userGrowth,
      timeRangeDays: timeRange,
    };
  });

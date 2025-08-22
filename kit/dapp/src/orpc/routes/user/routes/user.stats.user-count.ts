import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { systemRouter } from "@/orpc/procedures/system.router";
import { z } from "zod";

/**
 * GraphQL query to fetch user count metrics
 * Optimized for the User Stats Widget specifically
 */
const USER_COUNT_QUERY = theGraphGraphql(`
  query UserCount($since: Timestamp!) {
    # Total active users (users who hold or have held tokens)
    accountStatsStates {
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
const UserCountResponseSchema = z.object({
  accountStatsStates: z.array(
    z.object({
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
 * User count route handler.
 *
 * Fetches user count metrics specifically for the User Stats Widget:
 * - Total number of active users (users who hold or have held tokens)
 * - Number of recently active users in the specified time range
 *
 * This endpoint is optimized for displaying user count summaries.
 *
 * Authentication: Required
 * Method: GET /user/stats/user-count
 *
 * @param input.timeRange - Number of days to look back for recent activity (default: 7)
 * @returns Promise<UserCountMetrics> - User count metrics
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get user count for the last 30 days
 * const stats = await orpc.user.statsUserCount.query({ input: { timeRange: 30 } });
 * console.log(`Total: ${stats.totalUsers}, Recent: ${stats.recentUsers}`);
 * ```
 */
export const statsUserCount = systemRouter.user.statsUserCount
  .handler(async ({ context, input }) => {
    // System context is guaranteed by systemMiddleware

    // timeRange is guaranteed to have a value from the schema default
    const timeRange = input.timeRange;

    // Calculate the date range for queries
    const since = new Date();
    since.setDate(since.getDate() - timeRange);
    const sinceTimestamp = Math.floor(since.getTime() / 1000); // Convert to Unix timestamp

    // Fetch user count data in a single query
    const response = await context.theGraphClient.query(USER_COUNT_QUERY, {
      input: {
        since: sinceTimestamp.toString(),
      },
      output: UserCountResponseSchema,
    });

    // Calculate metrics
    const totalUsers = response.accountStatsStates.length;
    const recentUsers = countUniqueRecentUsers(response.recentActiveUsers);

    return {
      totalUsers,
      recentUsers,
      timeRangeDays: timeRange,
    };
  });

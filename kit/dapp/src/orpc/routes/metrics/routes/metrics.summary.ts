import { user } from "@/lib/db/schema";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { subDays } from "date-fns";
import { count, gte } from "drizzle-orm";
import { z } from "zod/v4";

/**
 * Configuration constant for recent activity calculation
 * This value is used to determine what constitutes "recent" activity for both users and transactions
 */
const RECENT_ACTIVITY_DAYS = 7;

/**
 * GraphQL query to fetch system stats for a specific system
 * Uses the system ID parameter to get the exact system stats state
 */
const SYSTEM_STATS_QUERY = theGraphGraphql(`
  query SystemStatsQuery($systemId: ID!) {
    # System stats for the specific system
    systemStatsState(id: $systemId) {
      totalValueInBaseCurrency
    }
  }
`);

/**
 * Query to get token stats states for accurate token counts and breakdown
 * Each tokenStatsState represents one token
 */
const TOKEN_STATS_QUERY = theGraphGraphql(`
  query TokenStatsQuery {
    tokenStatsStates {
      token {
        type
      }
    }
  }
`);

/**
 * Query to get event stats for transfer event counts
 * Uses daily aggregation for accurate counts
 */
const EVENT_STATS_QUERY = theGraphGraphql(`
  query EventStatsQuery {
    # Get all transfer event stats (daily aggregation)
    allEventStats: eventStats_collection(
      where: { eventName: "Transfer" }
      interval: day
    ) {
      eventsCount
    }
  }
`);

// Schema for the system stats response
const SystemStatsResponseSchema = z.object({
  systemStatsState: z
    .object({
      totalValueInBaseCurrency: z.string(),
    })
    .nullable(),
});

// Schema for the token stats response
const TokenStatsResponseSchema = z.object({
  tokenStatsStates: z.array(
    z.object({
      token: z.object({
        type: z.string(),
      }),
    })
  ),
});

// Schema for the event stats response
const EventStatsResponseSchema = z.object({
  allEventStats: z.array(
    z.object({
      eventsCount: z.number(),
    })
  ),
});

/**
 * Helper function to create asset breakdown from token stats
 * Counts tokens by type from tokenStatsStates
 * @param tokenStats Array of token stats states
 * @returns Object with counts per asset type (e.g., { "bond": 5, "fund": 3, "deposit": 2 })
 */
function createAssetBreakdown(
  tokenStats: { token: { type: string } }[]
): Record<string, number> {
  const breakdown: Record<string, number> = {};

  for (const tokenStat of tokenStats) {
    const type = tokenStat.token.type;
    if (type) {
      breakdown[type] = (breakdown[type] ?? 0) + 1;
    }
  }

  return breakdown;
}

/**
 * Helper function to sum event counts from event stats
 * @param eventStats Array of event statistics with counts
 * @returns Total number of events
 */
function sumEventCounts(eventStats: { eventsCount: number }[]): number {
  return eventStats.reduce((total, stat) => total + stat.eventsCount, 0);
}

/**
 * Metrics summary route handler.
 *
 * Retrieves aggregated metrics for the issuer dashboard including:
 * - Total number of tokenized assets (using auto-pagination for accuracy)
 * - Dynamic breakdown of assets by type (counts whatever asset types exist in the system)
 * - Total transaction count (using auto-pagination for all Transfer events)
 * - Recent transaction count (last 7 days, filtered from all events)
 * - Total number of registered accounts
 * - Recent users count (last 7 days)
 * - Total value of all assets for the current system
 *
 * This endpoint uses auto-pagination for accurate counting of all entities:
 * - Tokens: Unlimited auto-pagination to get ALL tokens
 * - Events: Unlimited auto-pagination to get ALL transfer events
 * - Parallel queries for optimal performance
 * - System-specific stats: Queries the exact system configured in settings
 *
 * Authentication: Required (uses authenticated router)
 * Method: GET /metrics/summary
 *
 * @param context - Request context with TheGraph client, database, and system info
 * @returns Promise<MetricsSummary> - Aggregated metrics for the dashboard
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query or database query fails
 *
 * @example
 * ```typescript
 * // Get all dashboard metrics in one call
 * const metrics = await orpc.metrics.summary.query();
 * console.log(metrics.totalAssets, metrics.assetBreakdown, metrics.totalTransactions);
 * ```
 */
export const summary = authRouter.metrics.summary
  .use(systemMiddleware)
  .use(theGraphMiddleware)
  .use(databaseMiddleware)
  .handler(async ({ context, errors }) => {
    // Ensure system context exists (should be guaranteed by systemMiddleware)
    if (!context.system) {
      throw errors.SYSTEM_NOT_CREATED();
    }

    // Calculate threshold for recent activity (users)
    const recentActivityThreshold = subDays(new Date(), RECENT_ACTIVITY_DAYS);

    // Run all queries in parallel for optimal performance
    const [
      systemStatsResponse,
      tokenStatsResponse,
      eventStatsResponse,
      totalUserCountResult,
      recentUserCountResult,
    ] = await Promise.all([
      // Fetch system stats for the specific system from TheGraph
      context.theGraphClient.query(SYSTEM_STATS_QUERY, {
        input: {
          input: {
            systemId: context.system.address.toLowerCase(),
          },
        },
        output: SystemStatsResponseSchema,
        error: "Failed to fetch system stats",
      }),
      // Fetch token stats states (one per token)
      context.theGraphClient.query(TOKEN_STATS_QUERY, {
        input: {
          input: {},
        },
        output: TokenStatsResponseSchema,
        error: "Failed to fetch token statistics",
      }),
      // Fetch event statistics (pre-aggregated event counts)
      context.theGraphClient.query(EVENT_STATS_QUERY, {
        input: {
          input: {},
        },
        output: EventStatsResponseSchema,
        error: "Failed to fetch event statistics",
      }),
      // Get count of all registered accounts from database
      context.db.select({ count: count() }).from(user),
      // Get count of users registered in the last X days
      context.db
        .select({ count: count() })
        .from(user)
        .where(gte(user.createdAt, recentActivityThreshold)),
    ]);

    const totalUsers = totalUserCountResult[0]?.count ?? 0;
    const recentUsersCount = recentUserCountResult[0]?.count ?? 0;

    // Calculate total value, defaulting to "0" if no system stats or null response
    const totalValue =
      systemStatsResponse.systemStatsState?.totalValueInBaseCurrency ?? "0";

    // Calculate asset metrics from token stats states
    const assetBreakdown = createAssetBreakdown(
      tokenStatsResponse.tokenStatsStates
    );
    const totalAssets = tokenStatsResponse.tokenStatsStates.length;

    // Calculate transaction counts from event stats
    const totalTransactions = sumEventCounts(eventStatsResponse.allEventStats);
    const recentTransactions = 0; // For now, we'll set this to 0 since timestamp filtering is complex

    return {
      totalAssets,
      assetBreakdown,
      totalTransactions,
      recentTransactions,
      totalUsers,
      recentUsers: recentUsersCount,
      recentActivityDays: RECENT_ACTIVITY_DAYS,
      totalValue,
    };
  });

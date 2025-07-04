import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
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
        totalSupply
        symbol
        name
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

/**
 * Query to get account stats states for active user counts
 * Each accountStatsState represents one active user (user who holds/held tokens)
 */
const ACCOUNT_STATS_QUERY = theGraphGraphql(`
  query AccountStatsQuery {
    accountStatsStates {
      account {
        id
      }
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
        totalSupply: z.string(),
        symbol: z.string(),
        name: z.string(),
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

// Schema for the account stats response
const AccountStatsResponseSchema = z.object({
  accountStatsStates: z.array(
    z.object({
      account: z.object({
        id: z.string(),
      }),
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
 * Helper function to create asset supply breakdown from token stats
 * Sums total supply by asset type from tokenStatsStates
 * @param tokenStats Array of token stats states with total supply
 * @returns Object with total supply per asset type (e.g., { "bond": "1000000", "fund": "500000" })
 */
function createAssetSupplyBreakdown(
  tokenStats: { token: { type: string; totalSupply: string } }[]
): Record<string, string> {
  const breakdown: Record<string, string> = {};

  for (const tokenStat of tokenStats) {
    const type = tokenStat.token.type;
    const supply = tokenStat.token.totalSupply;

    if (type && supply) {
      // Convert to number for calculation, then back to string
      const currentSupply = parseFloat(breakdown[type] ?? "0");
      const newSupply = parseFloat(supply);
      breakdown[type] = (currentSupply + newSupply).toString();
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
 * Retrieves aggregated metrics for the issuer dashboard using pre-built stats entities:
 * - Total number of tokenized assets (from tokenStatsStates count)
 * - Dynamic breakdown of assets by type (from tokenStatsStates grouped by type)
 * - Total transaction count (from eventStats_collection aggregation)
 * - Recent transaction count (set to 0 for now, timestamp filtering is complex)
 * - Total number of active users (from accountStatsStates - users who hold/held tokens)
 * - Recent active users count (set to 0 for now, would need time-series account data)
 * - Total value of all assets for the current system (from SystemStatsState)
 *
 * This approach uses the subgraph's purpose-built statistics entities:
 * - tokenStatsStates: One entry per token with type information
 * - eventStats_collection: Pre-aggregated event counts with daily intervals
 * - accountStatsStates: One entry per active user (who holds/held tokens)
 * - SystemStatsState: Pre-calculated system-wide totals
 * - All queries run in parallel for optimal performance
 *
 * Note: "Active users" means users who have interacted with tokens (hold or have held tokens),
 * not just registered users. This provides a more meaningful metric of platform engagement.
 *
 * Authentication: Required (uses authenticated router)
 * Method: GET /metrics/summary
 *
 * @param context - Request context with TheGraph client and system info
 * @returns Promise<MetricsSummary> - Aggregated metrics for the dashboard
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get all dashboard metrics in one call
 * const metrics = await orpc.metrics.summary.query();
 * console.log(metrics.totalAssets, metrics.assetBreakdown, metrics.totalUsers);
 * ```
 */
export const summary = authRouter.metrics.summary
  .use(systemMiddleware)
  .use(theGraphMiddleware)
  .handler(async ({ context, errors }) => {
    // Ensure system context exists (should be guaranteed by systemMiddleware)
    if (!context.system) {
      throw errors.SYSTEM_NOT_CREATED();
    }

    // Run all queries in parallel for optimal performance
    const [
      systemStatsResponse,
      tokenStatsResponse,
      eventStatsResponse,
      accountStatsResponse,
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
      // Fetch account stats states (one per active user)
      context.theGraphClient.query(ACCOUNT_STATS_QUERY, {
        input: {
          input: {},
        },
        output: AccountStatsResponseSchema,
        error: "Failed to fetch account statistics",
      }),
    ]);

    // Calculate active user counts from account stats (users who hold/held tokens)
    const totalUsers = accountStatsResponse.accountStatsStates.length;
    const recentUsersCount = 0; // For now, set to 0 (recent user filtering would need time-series data)

    // Calculate total value, defaulting to "0" if no system stats or null response
    const totalValue =
      systemStatsResponse.systemStatsState?.totalValueInBaseCurrency ?? "0";

    // Calculate asset metrics from token stats states
    const assetBreakdown = createAssetBreakdown(
      tokenStatsResponse.tokenStatsStates
    );
    const assetSupplyBreakdown = createAssetSupplyBreakdown(
      tokenStatsResponse.tokenStatsStates
    );
    const totalAssets = tokenStatsResponse.tokenStatsStates.length;

    // Calculate transaction counts from event stats
    const totalTransactions = sumEventCounts(eventStatsResponse.allEventStats);
    const recentTransactions = 0; // For now, we'll set this to 0 since timestamp filtering is complex

    return {
      totalAssets,
      assetBreakdown,
      assetSupplyBreakdown,
      totalTransactions,
      recentTransactions,
      totalUsers,
      recentUsers: recentUsersCount,
      recentActivityDays: RECENT_ACTIVITY_DAYS,
      totalValue,
    };
  });

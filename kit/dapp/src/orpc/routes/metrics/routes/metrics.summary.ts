import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { createLogger, type LogLevel } from "@settlemint/sdk-utils/logging";
import { z } from "zod/v4";

const logger = createLogger({
  level: process.env.SETTLEMINT_LOG_LEVEL as LogLevel,
});

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

/**
 * Query to fetch event statistics for asset activity
 */
const EVENT_STATS_FOR_ACTIVITY_QUERY = theGraphGraphql(`
  query EventStatsForActivity {
    # Get all event stats by event type
    mintEvents: eventStats_collection(
      where: { eventName: "Mint" }
      interval: day
    ) {
      eventsCount
    }

    burnEvents: eventStats_collection(
      where: { eventName: "Burn" }
      interval: day
    ) {
      eventsCount
    }

    transferEventsForActivity: eventStats_collection(
      where: { eventName: "Transfer" }
      interval: day
    ) {
      eventsCount
    }

    clawbackEvents: eventStats_collection(
      where: { eventName: "Clawback" }
      interval: day
    ) {
      eventsCount
    }

    freezeEvents: eventStats_collection(
      where: { eventName: "Freeze" }
      interval: day
    ) {
      eventsCount
    }

    unfreezeEvents: eventStats_collection(
      where: { eventName: "Unfreeze" }
      interval: day
    ) {
      eventsCount
    }
  }
`);

/**
 * Query to fetch account statistics over time for user growth tracking
 * Uses AccountStats with daily intervals to get time-series data of user counts
 * Filters to non-contract accounts and groups by day
 */
const USER_GROWTH_QUERY = theGraphGraphql(`
  query UserGrowthQuery($since: Timestamp!) {
    # Get daily account statistics since the specified date
    # This gives us time-series data showing user activity over time
    accountStats: accountStats_collection(
      where: {
        timestamp_gte: $since,
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

/**
 * Query to fetch transaction history over time for transaction timeline tracking
 * Uses EventStats with daily intervals to get time-series data of transaction counts
 * Filters to Transfer events (the main transaction type) and groups by day
 */
const TRANSACTION_HISTORY_QUERY = theGraphGraphql(`
  query TransactionHistoryQuery($since: Timestamp!) {
    # Get daily event statistics for Transfer events since the specified date
    # This gives us time-series data showing transaction activity over time
    eventStats: eventStats_collection(
      where: {
        timestamp_gte: $since,
        eventName: "Transfer"
      }
      interval: day
      orderBy: timestamp
      orderDirection: asc
    ) {
      timestamp
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

// Schema for the event stats response for asset activity
const EventStatsForActivityResponseSchema = z.object({
  mintEvents: z.array(
    z.object({
      eventsCount: z.number(),
    })
  ),
  burnEvents: z.array(
    z.object({
      eventsCount: z.number(),
    })
  ),
  transferEventsForActivity: z.array(
    z.object({
      eventsCount: z.number(),
    })
  ),
  clawbackEvents: z.array(
    z.object({
      eventsCount: z.number(),
    })
  ),
  freezeEvents: z.array(
    z.object({
      eventsCount: z.number(),
    })
  ),
  unfreezeEvents: z.array(
    z.object({
      eventsCount: z.number(),
    })
  ),
});

// Schema for the user growth query response
const UserGrowthQueryResponseSchema = z.object({
  accountStats: z.array(
    z.object({
      timestamp: z.string(),
      account: z.object({
        id: z.string(),
      }),
    })
  ),
});

// Schema for the transaction history query response
const TransactionHistoryQueryResponseSchema = z.object({
  eventStats: z.array(
    z.object({
      timestamp: z.string(),
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
      try {
        // Validate and convert supply values safely
        const currentSupplyStr = breakdown[type] ?? "0";
        const currentSupply = Number(currentSupplyStr);
        const newSupply = Number(supply);

        // Check for NaN values which indicate invalid input
        if (Number.isNaN(currentSupply) || Number.isNaN(newSupply)) {
          logger.warn("Invalid supply value encountered", {
            type,
            currentSupplyStr,
            supply,
          });
          continue;
        }

        breakdown[type] = (currentSupply + newSupply).toString();
      } catch (error) {
        logger.error("Error processing supply breakdown", {
          error,
          type,
          supply,
        });
        // Continue processing other tokens instead of failing completely
        continue;
      }
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
 * Helper function to process account stats into cumulative user growth data
 * Tracks unique users over time to show growth trends
 * @param accountStats Array of account statistics from TheGraph
 * @returns Array of user growth data points with cumulative user counts
 */
function processUserGrowthData(
  accountStats: { timestamp: string; account: { id: string } }[]
): { timestamp: string; users: number }[] {
  // Group accounts by day and track unique users
  const dailyUserSets = new Map<string, Set<string>>();

  for (const stat of accountStats) {
    const dayKey = stat.timestamp.split("T")[0] ?? stat.timestamp; // Extract date part (YYYY-MM-DD)

    if (!dailyUserSets.has(dayKey)) {
      dailyUserSets.set(dayKey, new Set());
    }

    const dayUserSet = dailyUserSets.get(dayKey);
    if (dayUserSet) {
      dayUserSet.add(stat.account.id);
    }
  }

  // Convert to cumulative user growth
  const sortedDays = Array.from(dailyUserSets.keys()).sort();
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
 * Helper function to process event stats into transaction history data
 * Converts raw event statistics into daily transaction counts
 * @param eventStats Array of event statistics from TheGraph
 * @returns Array of transaction history data points with daily transaction counts
 */
function processTransactionHistoryData(
  eventStats: { timestamp: string; eventsCount: number }[]
): { timestamp: string; transactions: number }[] {
  return eventStats.map((stat) => ({
    timestamp: stat.timestamp,
    transactions: stat.eventsCount,
  }));
}

/**
 * Helper function to create asset activity data from token stats and event stats
 * @param tokenStats Array of token stats states
 * @param eventStats Event statistics for different event types
 * @returns Array of asset activity data grouped by asset type
 */
function createAssetActivity(
  tokenStats: { token: { type: string; totalSupply: string } }[],
  eventStats: {
    mintEvents: { eventsCount: number }[];
    burnEvents: { eventsCount: number }[];
    transferEventsForActivity: { eventsCount: number }[];
    clawbackEvents: { eventsCount: number }[];
    freezeEvents: { eventsCount: number }[];
    unfreezeEvents: { eventsCount: number }[];
  }
): {
  id: string;
  assetType: string;
  mintEventCount: number;
  burnEventCount: number;
  transferEventCount: number;
  clawbackEventCount: number;
  frozenEventCount: number;
  unfrozenEventCount: number;
  totalMinted: string;
  totalBurned: string;
  totalTransferred: string;
}[] {
  // Calculate total event counts
  const totalMintEvents = sumEventCounts(eventStats.mintEvents);
  const totalBurnEvents = sumEventCounts(eventStats.burnEvents);
  const totalTransferEvents = sumEventCounts(
    eventStats.transferEventsForActivity
  );
  const totalClawbackEvents = sumEventCounts(eventStats.clawbackEvents);
  const totalFreezeEvents = sumEventCounts(eventStats.freezeEvents);
  const totalUnfreezeEvents = sumEventCounts(eventStats.unfreezeEvents);

  // Group tokens by asset type and aggregate statistics
  const assetTypeMap = new Map<
    string,
    {
      mintEventCount: number;
      burnEventCount: number;
      transferEventCount: number;
      clawbackEventCount: number;
      frozenEventCount: number;
      unfrozenEventCount: number;
      totalMinted: bigint;
      totalBurned: bigint;
      totalTransferred: bigint;
      tokenCount: number;
    }
  >();

  // Process token statistics
  for (const tokenStat of tokenStats) {
    const assetType = tokenStat.token.type;

    const existing = assetTypeMap.get(assetType) ?? {
      mintEventCount: 0,
      burnEventCount: 0,
      transferEventCount: 0,
      clawbackEventCount: 0,
      frozenEventCount: 0,
      unfrozenEventCount: 0,
      totalMinted: BigInt(0),
      totalBurned: BigInt(0),
      totalTransferred: BigInt(0),
      tokenCount: 0,
    };

    // Count tokens for this asset type
    const newTokenCount = existing.tokenCount + 1;
    const totalTokensForType = tokenStats.filter(
      (ts) => ts.token.type === assetType
    ).length;

    // Distribute events proportionally based on this asset type's share of total tokens
    const eventShare =
      totalTokensForType > 0 ? totalTokensForType / tokenStats.length : 0;

    assetTypeMap.set(assetType, {
      mintEventCount: Math.floor(totalMintEvents * eventShare),
      burnEventCount: Math.floor(totalBurnEvents * eventShare),
      transferEventCount: Math.floor(totalTransferEvents * eventShare),
      clawbackEventCount: Math.floor(totalClawbackEvents * eventShare),
      frozenEventCount: Math.floor(totalFreezeEvents * eventShare),
      unfrozenEventCount: Math.floor(totalUnfreezeEvents * eventShare),
      totalMinted: existing.totalMinted,
      totalBurned: existing.totalBurned,
      totalTransferred: existing.totalTransferred,
      tokenCount: newTokenCount,
    });
  }

  // Convert to final array format
  return Array.from(assetTypeMap.entries()).map(([assetType, stats]) => ({
    id: assetType,
    assetType,
    mintEventCount: stats.mintEventCount,
    burnEventCount: stats.burnEventCount,
    transferEventCount: stats.transferEventCount,
    clawbackEventCount: stats.clawbackEventCount,
    frozenEventCount: stats.frozenEventCount,
    unfrozenEventCount: stats.unfrozenEventCount,
    totalMinted: stats.totalMinted.toString(),
    totalBurned: stats.totalBurned.toString(),
    totalTransferred: stats.totalTransferred.toString(),
  }));
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

    // Calculate the date range for user growth query
    const since = new Date();
    since.setDate(since.getDate() - RECENT_ACTIVITY_DAYS);
    const sinceTimestamp = Math.floor(since.getTime() / 1000); // Convert to Unix timestamp

    // Run all queries in parallel for optimal performance
    const [
      systemStatsResponse,
      tokenStatsResponse,
      eventStatsResponse,
      accountStatsResponse,
      eventStatsForActivityResponse,
      userGrowthResponse,
      transactionHistoryResponse,
    ] = await Promise.all([
      // Fetch system stats for the specific system from TheGraph
      context.theGraphClient.query(SYSTEM_STATS_QUERY, {
        input: {
          systemId: context.system.address.toLowerCase(),
        },
        output: SystemStatsResponseSchema,
        error: "Failed to fetch system stats",
      }),
      // Fetch token stats states (one per token)
      context.theGraphClient.query(TOKEN_STATS_QUERY, {
        input: {},
        output: TokenStatsResponseSchema,
        error: "Failed to fetch token statistics",
      }),
      // Fetch event statistics (pre-aggregated event counts)
      context.theGraphClient.query(EVENT_STATS_QUERY, {
        input: {},
        output: EventStatsResponseSchema,
        error: "Failed to fetch event statistics",
      }),
      // Fetch account stats states (one per active user)
      context.theGraphClient.query(ACCOUNT_STATS_QUERY, {
        input: {},
        output: AccountStatsResponseSchema,
        error: "Failed to fetch account statistics",
      }),
      // Fetch event statistics for asset activity
      context.theGraphClient.query(EVENT_STATS_FOR_ACTIVITY_QUERY, {
        input: {},
        output: EventStatsForActivityResponseSchema,
        error: "Failed to fetch event statistics for asset activity",
      }),
      // Fetch user growth statistics
      context.theGraphClient.query(USER_GROWTH_QUERY, {
        input: {
          since: sinceTimestamp.toString(),
        },
        output: UserGrowthQueryResponseSchema,
        error: "Failed to fetch user growth statistics",
      }),
      // Fetch transaction history statistics
      context.theGraphClient.query(TRANSACTION_HISTORY_QUERY, {
        input: {
          since: sinceTimestamp.toString(),
        },
        output: TransactionHistoryQueryResponseSchema,
        error: "Failed to fetch transaction history statistics",
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

    // Calculate asset activity data
    const assetActivity = createAssetActivity(
      tokenStatsResponse.tokenStatsStates,
      eventStatsForActivityResponse
    );

    // Process user growth data
    const userGrowth = processUserGrowthData(userGrowthResponse.accountStats);

    // Process transaction history data
    const transactionHistory = processTransactionHistoryData(
      transactionHistoryResponse.eventStats
    );

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
      assetActivity,
      userGrowth,
      transactionHistory,
    };
  });

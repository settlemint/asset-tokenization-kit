import { user } from "@/lib/db/schema";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { getUnixTime, subDays } from "date-fns";
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
 * Query to get all tokens with unlimited auto-pagination
 * This will automatically handle pagination to get ALL tokens, not just first 1000
 */
const ALL_TOKENS_QUERY = theGraphGraphql(`
  query AllTokensQuery($skip: Int!, $first: Int!) {
    tokens(
      skip: $skip
      first: $first
    ) {
      id
      type
      totalSupply
    }
  }
`);

/**
 * Query to get all transfer events with unlimited auto-pagination
 * This will automatically handle pagination to get ALL transfer events
 */
const ALL_TRANSFER_EVENTS_QUERY = theGraphGraphql(`
  query AllTransferEventsQuery($skip: Int!, $first: Int!) {
    events(
      skip: $skip
      first: $first
      where: { eventName: "Transfer" }
    ) {
      id
      blockTimestamp
    }
  }
`);

// Schema for the system stats response
const SystemStatsResponseSchema = z.object({
  systemStatsState: z.object({
    totalValueInBaseCurrency: z.string(),
  }).nullable(),
});

// Schema for the tokens response
const TokensResponseSchema = z.object({
  tokens: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      totalSupply: z.string(),
    })
  ),
});

// Schema for the events response
const EventsResponseSchema = z.object({
  events: z.array(
    z.object({
      id: z.string(),
      blockTimestamp: z.string(),
    })
  ),
});

/**
 * Helper function to create asset breakdown from tokens
 * Dynamically counts all asset types found in the system
 * This is future-proof and doesn't require hardcoding specific asset types
 * @param tokens Array of tokens with their types
 * @returns Object with counts per asset type (e.g., { "bond": 5, "fund": 3, "deposit": 2 })
 */
function createAssetBreakdown(tokens: { type: string }[]) {
  const breakdown: Record<string, number> = {};

  for (const token of tokens) {
    if (token.type) {
      breakdown[token.type] = (breakdown[token.type] ?? 0) + 1;
    }
  }

  return breakdown;
}

/**
 * Helper function to filter events by timestamp
 * @param events Array of events with blockTimestamp
 * @param thresholdTimestamp Unix timestamp threshold
 * @returns Count of events after the threshold
 */
function countRecentEvents(events: { blockTimestamp: string }[], thresholdTimestamp: string): number {
  return events.filter(event =>
    parseInt(event.blockTimestamp) >= parseInt(thresholdTimestamp)
  ).length;
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

    // Calculate threshold for recent activity (users and transactions)
    const recentActivityThreshold = subDays(new Date(), RECENT_ACTIVITY_DAYS);
    const recentEventsTimestamp = getUnixTime(recentActivityThreshold).toString();

    // Run all queries in parallel for optimal performance
    const [systemStatsResponse, tokensResponse, eventsResponse, totalUserCountResult, recentUserCountResult] = await Promise.all([
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
      // Fetch ALL tokens using auto-pagination (unlimited results)
      context.theGraphClient.query(ALL_TOKENS_QUERY, {
        input: {
          input: {
            offset: 0,
            // No limit specified = unlimited auto-pagination
          },
        },
        output: TokensResponseSchema,
        error: "Failed to fetch all tokens",
      }),
      // Fetch ALL transfer events using auto-pagination (unlimited results)
      context.theGraphClient.query(ALL_TRANSFER_EVENTS_QUERY, {
        input: {
          input: {
            offset: 0,
            // No limit specified = unlimited auto-pagination
          },
        },
        output: EventsResponseSchema,
        error: "Failed to fetch all transfer events",
      }),
      // Get count of all registered accounts from database
      context.db
        .select({ count: count() })
        .from(user),
      // Get count of users registered in the last X days (using same threshold as transactions)
      context.db
        .select({ count: count() })
        .from(user)
        .where(gte(user.createdAt, recentActivityThreshold)),
    ]);

    const totalUsers = totalUserCountResult[0]?.count ?? 0;
    const recentUsersCount = recentUserCountResult[0]?.count ?? 0;

    // Calculate total value, defaulting to "0" if no system stats or null response
    const totalValue = systemStatsResponse.systemStatsState?.totalValueInBaseCurrency ?? "0";

    // Calculate event counts
    const totalTransactions = eventsResponse.events.length;
    const recentTransactions = countRecentEvents(eventsResponse.events, recentEventsTimestamp);

    // Create asset breakdown from all tokens (auto-paginated)
    const assetBreakdown = createAssetBreakdown(tokensResponse.tokens);

    return {
      totalAssets: tokensResponse.tokens.length,
      assetBreakdown,
      totalTransactions,
      recentTransactions,
      totalUsers,
      recentUsers: recentUsersCount,
      recentActivityDays: RECENT_ACTIVITY_DAYS,
      totalValue,
    };
  });

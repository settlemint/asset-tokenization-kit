import { user } from "@/lib/db/schema";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
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
 * GraphQL query to fetch comprehensive metrics for the dashboard
 * This query aggregates data from multiple entities to provide a complete overview
 */
const METRICS_SUMMARY_QUERY = theGraphGraphql(`
  query MetricsSummaryQuery($recentEventsTimestamp: BigInt!) {
    # Count of tokens (assets) with their type
    tokens(first: 1000) {
      id
      type
      totalSupply
    }

    # Count of all transfer events (transactions)
    events(first: 1000, where: { eventName: "Transfer" }) {
      id
    }

    # Count of recent transfer events (transactions in last 7 days)
    recentEvents: events(first: 1000, where: { eventName: "Transfer", blockTimestamp_gte: $recentEventsTimestamp }) {
      id
    }

    # System stats for total value
    systemStatsStates(first: 1) {
      totalValueInBaseCurrency
    }
  }
`);

// Schema for the GraphQL response
const MetricsResponseSchema = z.object({
  tokens: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      totalSupply: z.string(),
    })
  ),
  events: z.array(
    z.object({
      id: z.string(),
    })
  ),
  recentEvents: z.array(
    z.object({
      id: z.string(),
    })
  ),
  systemStatsStates: z.array(
    z.object({
      totalValueInBaseCurrency: z.string(),
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
 * Metrics summary route handler.
 *
 * Retrieves aggregated metrics for the issuer dashboard including:
 * - Total number of tokenized assets
 * - Dynamic breakdown of assets by type (counts whatever asset types exist in the system)
 * - Total transaction count
 * - Recent transaction count (last 7 days)
 * - Total number of registered accounts
 * - Recent users count (last 7 days)
 * - Total value of all assets
 *
 * This endpoint consolidates multiple queries into a single request
 * for optimal dashboard performance.
 *
 * Authentication: Required (uses authenticated router)
 * Method: GET /metrics/summary
 *
 * @param context - Request context with TheGraph client and database
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
  .use(theGraphMiddleware)
  .use(databaseMiddleware)
  .handler(async ({ context }) => {
    // Calculate threshold for recent activity (users and transactions)
    const recentActivityThreshold = subDays(new Date(), RECENT_ACTIVITY_DAYS);
    const recentEventsTimestamp = getUnixTime(recentActivityThreshold).toString();

    // Fetch blockchain metrics from TheGraph
    const response = await context.theGraphClient.query(METRICS_SUMMARY_QUERY, {
      input: {
        input: {
          recentEventsTimestamp,
        },
      },
      output: MetricsResponseSchema,
      error: "Failed to fetch metrics summary",
    });

    // Get count of all registered accounts from database
    const [totalUserCountResult] = await context.db
      .select({ count: count() })
      .from(user);

    // Get count of users registered in the last X days (using same threshold as transactions)
    const [recentUserCountResult] = await context.db
      .select({ count: count() })
      .from(user)
      .where(gte(user.createdAt, recentActivityThreshold));

    const totalUsers = totalUserCountResult?.count ?? 0;
    const recentUsersCount = recentUserCountResult?.count ?? 0;

    // Calculate total value, defaulting to "0" if no system stats
    const totalValue =
      response.systemStatsStates.length > 0 && response.systemStatsStates[0]
        ? response.systemStatsStates[0].totalValueInBaseCurrency
        : "0";

    // Create asset breakdown from tokens
    const assetBreakdown = createAssetBreakdown(response.tokens);

    return {
      totalAssets: response.tokens.length,
      assetBreakdown,
      totalTransactions: response.events.length,
      recentTransactions: response.recentEvents.length,
      totalUsers,
      recentUsers: recentUsersCount,
      recentActivityDays: RECENT_ACTIVITY_DAYS,
      totalValue,
    };
  });

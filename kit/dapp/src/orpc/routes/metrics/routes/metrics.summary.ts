import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { baseRouter } from "@/orpc/procedures/base.router";
import { authMiddleware } from "@/orpc/middlewares/auth/auth.middleware";
import { errorMiddleware } from "@/orpc/middlewares/monitoring/error.middleware";
import { sessionMiddleware } from "@/orpc/middlewares/auth/session.middleware";
import { MetricsSummarySchema } from "@/orpc/routes/metrics/routes/metrics.summary.schema";
import { z } from "zod/v4";

/**
 * GraphQL query to fetch comprehensive metrics for the dashboard
 * This query aggregates data from multiple entities to provide a complete overview
 */
const METRICS_SUMMARY_QUERY = theGraphGraphql(`
  query MetricsSummaryQuery {
    # Count of tokens (assets)
    tokens(first: 1000) {
      id
      totalSupply
    }
    
    # Count of transfer events (transactions)
    events(first: 1000, where: { eventName: "Transfer" }) {
      id
    }
    
    # Count of accounts with token balances (users)
    tokenBalances(first: 1000, where: { value_gt: "0" }) {
      account {
        id
      }
    }
    
    # System stats for total value
    systemStatsStates(first: 1) {
      totalValueInBaseCurrency
    }
  }
`);

// Schema for the GraphQL response
const MetricsResponseSchema = z.object({
  tokens: z.array(z.object({
    id: z.string(),
    totalSupply: z.string(),
  })),
  events: z.array(z.object({
    id: z.string(),
  })),
  tokenBalances: z.array(z.object({
    account: z.object({
      id: z.string(),
    }),
  })),
  systemStatsStates: z.array(z.object({
    totalValueInBaseCurrency: z.string(),
  })),
});

/**
 * Metrics summary route handler.
 *
 * Retrieves aggregated metrics for the issuer dashboard including:
 * - Total number of tokenized assets
 * - Total transaction count
 * - Total number of users
 * - Total value of all assets
 *
 * This endpoint consolidates multiple queries into a single request
 * for optimal dashboard performance.
 *
 * Authentication: Required (uses authenticated router)
 * Method: GET /metrics/summary
 *
 * @param context - Request context with TheGraph client
 * @returns Promise<MetricsSummary> - Aggregated metrics for the dashboard
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get all dashboard metrics in one call
 * const metrics = await orpc.metrics.summary.query();
 * console.log(metrics.totalAssets, metrics.totalTransactions);
 * ```
 */
export const summary = baseRouter.metrics.summary
  .use(errorMiddleware)
  .use(sessionMiddleware)
  .use(authMiddleware)
  .use(theGraphMiddleware)
  .handler(async ({ context }) => {
    const response = await context.theGraphClient.query(METRICS_SUMMARY_QUERY, {
      input: {
        input: {},
      },
      output: MetricsResponseSchema,
      error: "Failed to fetch metrics summary",
    });

    // Extract unique users from token balances
    const uniqueUsers = new Set(
      response.tokenBalances.map(balance => balance.account.id)
    );

    // Calculate total value, defaulting to "0" if no system stats
    const totalValue = response.systemStatsStates.length > 0 && response.systemStatsStates[0]
      ? response.systemStatsStates[0].totalValueInBaseCurrency
      : "0";

    return {
      totalAssets: response.tokens.length,
      totalTransactions: response.events.length,
      totalUsers: uniqueUsers.size,
      totalValue,
    };
  });
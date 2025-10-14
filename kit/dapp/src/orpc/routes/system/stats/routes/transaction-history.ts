import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import * as z from "zod";

/**
 * GraphQL query to fetch transaction-related metrics
 * Combines total transaction counts with time-series data for history tracking
 */
const TRANSACTION_METRICS_QUERY = theGraphGraphql(`
  query TransactionMetrics($since: Timestamp!) {
    # Total transaction count (all Transfer events)
    totalTransactions: eventStats_collection(
      where: { eventName: "Transfer" }
      interval: day
    ) {
      eventsCount
    }

    # Recent transactions in the specified time range
    recentTransactions: eventStats_collection(
      where: {
        timestamp_gte: $since
        eventName: "Transfer"
      }
      interval: day
    ) {
      eventsCount
    }

    # Transaction history over time for charting
    transactionHistory: eventStats_collection(
      where: {
        timestamp_gte: $since
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

// Schema for the GraphQL response
const TransactionMetricsResponseSchema = z.object({
  totalTransactions: z.array(
    z.object({
      eventsCount: z.number(),
    })
  ),
  recentTransactions: z.array(
    z.object({
      eventsCount: z.number(),
    })
  ),
  transactionHistory: z.array(
    z.object({
      timestamp: z.string(),
      eventsCount: z.number(),
    })
  ),
});

/**
 * Helper function to sum event counts from event stats
 */
function sumEventCounts(eventStats: { eventsCount: number }[]): number {
  return eventStats.reduce((total, stat) => total + stat.eventsCount, 0);
}

/**
 * Helper function to process event stats into transaction history data
 * Converts raw event statistics into daily transaction counts
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
 * System transaction history route handler.
 *
 * Fetches comprehensive system-wide transaction-related metrics including:
 * - Total number of transactions (all Transfer events)
 * - Number of recent transactions in the specified time range
 * - Transaction history data over time for charting
 *
 * This endpoint is optimized for dashboard transaction widgets and history charts.
 *
 * Authentication: Required
 * Method: GET /system/stats/transaction-history
 *
 * @param input.timeRange - Number of days to look back for recent activity (default: 7)
 * @returns Promise<SystemTransactionHistoryMetrics> - Comprehensive transaction metrics
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get transaction metrics for the last 14 days
 * const metrics = await orpc.system.stats.transactionHistory.query({ input: { timeRange: 14 } });
 * console.log(metrics.totalTransactions, metrics.transactionHistory);
 * ```
 */
export const statsTransactionHistory =
  authRouter.system.stats.transactionHistory
    .use(systemMiddleware)
    .use(theGraphMiddleware)
    .handler(async ({ context, input }) => {
      // System context is guaranteed by systemMiddleware

      // timeRange is guaranteed to have a value from the schema default
      const timeRange = input.timeRange;

      // Calculate the date range for queries
      const since = new Date();
      since.setDate(since.getDate() - timeRange);
      const sinceTimestamp = Math.floor(since.getTime() / 1000); // Convert to Unix timestamp

      // Fetch all transaction-related data in a single query
      const response = await context.theGraphClient.query(
        TRANSACTION_METRICS_QUERY,
        {
          input: {
            since: sinceTimestamp.toString(),
          },
          output: TransactionMetricsResponseSchema,
        }
      );

      // Calculate metrics
      const totalTransactions = sumEventCounts(response.totalTransactions);
      const recentTransactions = sumEventCounts(response.recentTransactions);
      const transactionHistory = processTransactionHistoryData(
        response.transactionHistory
      );

      return {
        totalTransactions,
        recentTransactions,
        transactionHistory,
        timeRangeDays: timeRange,
      };
    });

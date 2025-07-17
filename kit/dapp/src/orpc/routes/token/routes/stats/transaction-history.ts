import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { z } from "zod";

/**
 * GraphQL query to fetch transaction history data for time-series charts
 * Optimized for the Transaction History Chart specifically
 */
const TRANSACTION_HISTORY_QUERY = theGraphGraphql(`
  query TransactionHistory($since: Timestamp!) {
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
const TransactionHistoryResponseSchema = z.object({
  transactionHistory: z.array(
    z.object({
      timestamp: z.string(),
      eventsCount: z.number(),
    })
  ),
});

/**
 * Helper function to process event stats into transaction history data
 * Converts raw event statistics into daily transaction counts for charts
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
 * Transaction history route handler.
 *
 * Fetches transaction history data specifically for the Transaction History Chart.
 * Returns time-series data of daily transaction counts for area chart visualization.
 *
 * This endpoint is optimized for charts showing transaction trends over time.
 *
 * Authentication: Required
 * Method: GET /token/stats/transaction-history
 *
 * @param input.timeRange - Number of days to look back for history data (default: 7)
 * @returns Promise<TransactionHistoryMetrics> - Transaction history time-series data
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get transaction history for the last 14 days
 * const history = await orpc.token.statsTransactionHistory.query({ input: { timeRange: 14 } });
 * console.log('History:', history.transactionHistory);
 * ```
 */
export const statsTransactionHistory = authRouter.token.statsTransactionHistory
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

    // Fetch transaction history data
    const response = await context.theGraphClient.query(
      TRANSACTION_HISTORY_QUERY,
      {
        input: {
          since: sinceTimestamp.toString(),
        },
        output: TransactionHistoryResponseSchema,
        error: "Failed to fetch transaction history",
      }
    );

    // Process the transaction history data
    const transactionHistory = processTransactionHistoryData(
      response.transactionHistory
    );

    return {
      transactionHistory,
      timeRangeDays: timeRange,
    };
  });

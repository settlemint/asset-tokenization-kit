import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import * as z from "zod";

/**
 * GraphQL query to fetch transaction count metrics
 * Optimized for the Transaction Stats Widget specifically
 */
const TRANSACTION_COUNT_QUERY = theGraphGraphql(`
  query TransactionCount($since: Timestamp!) {
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
  }
`);

// Schema for the GraphQL response
const TransactionCountResponseSchema = z.object({
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
});

/**
 * Helper function to sum event counts from event stats
 */
function sumEventCounts(eventStats: { eventsCount: number }[]): number {
  return eventStats.reduce((total, stat) => total + stat.eventsCount, 0);
}

/**
 * System transaction count route handler.
 *
 * Fetches system-wide transaction count metrics:
 * - Total number of transactions (all Transfer events)
 * - Number of recent transactions in the specified time range
 *
 * This endpoint is optimized for displaying transaction count summaries.
 *
 * Authentication: Required
 * Method: GET /system/stats/transaction-count
 *
 * @param input.timeRange - Number of days to look back for recent activity (default: 7)
 * @returns Promise<SystemTransactionCountMetrics> - Transaction count metrics
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get transaction count for the last 14 days
 * const stats = await orpc.system.stats.transactionCount.query({ input: { timeRange: 14 } });
 * console.log(`Total: ${stats.totalTransactions}, Recent: ${stats.recentTransactions}`);
 * ```
 */
export const statsTransactionCount = authRouter.system.stats.transactionCount
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

    // Fetch transaction count data in a single query
    const response = await context.theGraphClient.query(
      TRANSACTION_COUNT_QUERY,
      {
        input: {
          since: sinceTimestamp.toString(),
        },
        output: TransactionCountResponseSchema,
      }
    );

    // Calculate metrics
    const totalTransactions = sumEventCounts(response.totalTransactions);
    const recentTransactions = sumEventCounts(response.recentTransactions);

    return {
      totalTransactions,
      recentTransactions,
      timeRangeDays: timeRange,
    };
  });

import { z } from "zod/v4";

/**
 * Schema for transaction metrics input parameters
 */
export const TransactionMetricsInputSchema = z.object({
  /** Time range in days for historical data (default: 7 days) */
  timeRange: z.number().min(1).max(365).optional().default(7),
});

/**
 * Schema for transaction metrics output
 * Contains transaction-related metrics including totals and history over time
 */
export const TransactionMetricsOutputSchema = z.object({
  /** Total number of transactions (all Transfer events) */
  totalTransactions: z.number(),

  /** Number of transactions in the specified time range */
  recentTransactions: z.number(),

  /** Transaction history data over time for charting */
  transactionHistory: z.array(
    z.object({
      /** ISO timestamp for this data point */
      timestamp: z.string(),

      /** Number of transactions on this day */
      transactions: z.number(),
    })
  ),

  /** The time range in days that was used for recent calculations */
  timeRangeDays: z.number(),
});

/**
 * Type definition for transaction metrics input
 */
export type TransactionMetricsInput = z.infer<
  typeof TransactionMetricsInputSchema
>;

/**
 * Type definition for transaction metrics output
 */
export type TransactionMetrics = z.infer<typeof TransactionMetricsOutputSchema>;


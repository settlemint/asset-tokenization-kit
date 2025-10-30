import { z } from "zod";

/**
 * Schema for system transaction history input parameters
 */
export const StatsTransactionHistoryInputSchema = z.object({
  /** Time range in days for historical data (default: 7 days) */
  timeRange: z.number().min(1).max(365).optional().default(7),
});

/**
 * Schema for system transaction history output
 * Contains transaction-related metrics including totals and history over time
 */
export const StatsTransactionHistoryOutputSchema = z.object({
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
 * Type definition for system transaction history input
 */
export type StatsTransactionHistoryInput = z.infer<
  typeof StatsTransactionHistoryInputSchema
>;

/**
 * Type definition for system transaction history output
 */
export type StatsTransactionHistoryOutput = z.infer<
  typeof StatsTransactionHistoryOutputSchema
>;

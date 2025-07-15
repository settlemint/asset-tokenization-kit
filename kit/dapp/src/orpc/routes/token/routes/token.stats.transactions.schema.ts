import { z } from "zod";

/**
 * Schema for transaction statistics input parameters
 */
export const TokenStatsTransactionsInputSchema = z.object({
  /** Time range in days for historical data (default: 7 days) */
  timeRange: z.number().min(1).max(365).optional().default(7),
});

/**
 * Schema for transaction statistics output
 * Contains transaction-related metrics including totals and history over time
 */
export const TokenStatsTransactionsOutputSchema = z.object({
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
 * Type definition for transaction statistics input
 */
export type TokenStatsTransactionsInput = z.infer<
  typeof TokenStatsTransactionsInputSchema
>;

/**
 * Type definition for transaction statistics output
 */
export type TokenStatsTransactions = z.infer<
  typeof TokenStatsTransactionsOutputSchema
>;

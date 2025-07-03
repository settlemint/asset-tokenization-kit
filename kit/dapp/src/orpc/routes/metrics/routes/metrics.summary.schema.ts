import { z } from "zod/v4";

/**
 * Schema for the metrics summary response
 * Contains aggregated statistics for the issuer dashboard
 */
export const MetricsSummarySchema = z.object({
  /**
   * Total number of tokenized assets across all factories
   */
  totalAssets: z.number(),
  
  /**
   * Total number of transactions (transfers) across all tokens
   */
  totalTransactions: z.number(),
  
  /**
   * Total number of unique users (accounts with token balances)
   */
  totalUsers: z.number(),
  
  /**
   * Total value of all tokens in the system (in USD or base currency)
   */
  totalValue: z.string(),
});

export type MetricsSummary = z.infer<typeof MetricsSummarySchema>;
import { z } from "zod/v4";

/**
 * Schema for asset breakdown by type
 * Dynamic record that can handle any asset type that exists in the system
 * This is future-proof and doesn't require hardcoding specific asset types
 */
export const AssetBreakdownSchema = z.record(z.string(), z.number());

export type AssetBreakdown = z.infer<typeof AssetBreakdownSchema>;

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
   * Breakdown of assets by type - dynamically includes all asset types found in the system
   * E.g., { "bond": 5, "fund": 3, "deposit": 2, "equity": 1, "stable-coin": 4 }
   */
  assetBreakdown: AssetBreakdownSchema,

  /**
   * Total number of transactions (transfers) across all tokens
   */
  totalTransactions: z.number(),

  /**
   * Number of recent transactions (last X days)
   */
  recentTransactions: z.number(),

  /**
   * Total number of unique users (accounts with token balances)
   */
  totalUsers: z.number(),

  /**
   * Number of users with recent activity (last X days)
   */
  recentUsers: z.number(),

  /**
   * Number of days used for recent activity calculation (both users and transactions)
   */
  recentActivityDays: z.number(),

  /**
   * Total value of all tokens in the system (in USD or base currency)
   */
  totalValue: z.string(),
});

export type MetricsSummary = z.infer<typeof MetricsSummarySchema>;

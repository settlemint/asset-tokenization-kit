import { z } from "zod/v4";

/**
 * Schema for asset breakdown by type
 * Dynamic record that can handle any asset type that exists in the system
 * This is future-proof and doesn't require hardcoding specific asset types
 */
export const AssetBreakdownSchema = z.record(z.string(), z.number());

export type AssetBreakdown = z.infer<typeof AssetBreakdownSchema>;

/**
 * Schema for asset activity data grouped by asset type
 */
export const AssetActivityDataSchema = z.object({
  id: z.string(),
  assetType: z.string(),
  mintEventCount: z.number(),
  burnEventCount: z.number(),
  transferEventCount: z.number(),
  clawbackEventCount: z.number(),
  frozenEventCount: z.number(),
  unfrozenEventCount: z.number(),
  totalMinted: z.string(),
  totalBurned: z.string(),
  totalTransferred: z.string(),
});

/**
 * Schema for asset activity array
 */
export const AssetActivitySchema = z.array(AssetActivityDataSchema);

export type AssetActivityData = z.infer<typeof AssetActivityDataSchema>;
export type AssetActivity = z.infer<typeof AssetActivitySchema>;

/**
 * Schema for user growth time series data point
 */
export const UserGrowthDataPointSchema = z.object({
  /**
   * The timestamp for this data point (ISO string)
   */
  timestamp: z.string(),

  /**
   * Number of users at this point in time
   */
  users: z.number(),
});

/**
 * Schema for user growth time series response
 */
export const UserGrowthSchema = z.object({
  /**
   * Array of user growth data points ordered by timestamp
   */
  users: z.array(UserGrowthDataPointSchema),
});

export type UserGrowthDataPoint = z.infer<typeof UserGrowthDataPointSchema>;
export type UserGrowth = z.infer<typeof UserGrowthSchema>;

/**
 * Schema for transaction history time series data point
 */
export const TransactionHistoryDataPointSchema = z.object({
  /**
   * The timestamp for this data point (ISO string)
   */
  timestamp: z.string(),

  /**
   * Number of transactions on this day
   */
  transactions: z.number(),
});

/**
 * Schema for transaction history time series response
 */
export const TransactionHistorySchema = z.object({
  /**
   * Array of transaction history data points ordered by timestamp
   */
  transactions: z.array(TransactionHistoryDataPointSchema),
});

export type TransactionHistoryDataPoint = z.infer<
  typeof TransactionHistoryDataPointSchema
>;
export type TransactionHistory = z.infer<typeof TransactionHistorySchema>;

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

  /**
   * Asset activity data grouped by asset type
   * Contains event counts and volume data for mint, burn, transfer, clawback operations
   */
  assetActivity: AssetActivitySchema,

  /**
   * User growth time series data for the last 7 days
   * Array of data points showing cumulative user growth over time
   */
  userGrowth: z.array(UserGrowthDataPointSchema),

  /**
   * Transaction history time series data for the last 7 days
   * Array of data points showing daily transaction counts over time
   */
  transactionHistory: z.array(TransactionHistoryDataPointSchema),
});

export type MetricsSummary = z.infer<typeof MetricsSummarySchema>;

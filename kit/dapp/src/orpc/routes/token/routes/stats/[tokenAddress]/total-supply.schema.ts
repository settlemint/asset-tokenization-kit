import { z } from "zod";

/**
 * Schema for asset-specific total supply input parameters
 */
export const TokenStatsAssetTotalSupplyInputSchema = z.object({
  /** The token address for which to fetch total supply history */
  tokenAddress: z.string().describe("The token contract address"),

  /** Time range in days for historical data (default: 30 days) */
  days: z.number().min(1).max(365).optional().default(30),
});

/**
 * Schema for asset-specific total supply output
 * Contains total supply history over time for a specific asset
 */
export const TokenStatsAssetTotalSupplyOutputSchema = z.object({
  /** Historical total supply data points for charting */
  totalSupplyHistory: z.array(
    z.object({
      /** Unix timestamp for this data point */
      timestamp: z.number(),

      /** Total supply value as string (BigDecimal) */
      totalSupply: z.string(),

      /** Total collateral value for stablecoin/tokenizeddeposit assets (optional) */
      totalCollateral: z.string().optional(),
    })
  ),
});

/**
 * Type definition for asset-specific total supply input
 */
export type TokenStatsAssetTotalSupplyInput = z.infer<
  typeof TokenStatsAssetTotalSupplyInputSchema
>;

/**
 * Type definition for asset-specific total supply output
 */
export type TokenStatsAssetTotalSupplyOutput = z.infer<
  typeof TokenStatsAssetTotalSupplyOutputSchema
>;

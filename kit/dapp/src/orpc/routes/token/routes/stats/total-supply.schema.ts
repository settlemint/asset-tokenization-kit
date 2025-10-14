import { ethereumAddress } from "@atk/zod/ethereum-address";
import { timestamp } from "@atk/zod/timestamp";
import * as z from "zod";

/**
 * Schema for asset-specific total supply input parameters
 */
export const StatsTotalSupplyInputSchema = z.object({
  /** The token address for which to fetch total supply history */
  tokenAddress: ethereumAddress.describe("The token contract address"),

  /** Time range in days for historical data (default: 30 days) */
  days: z.number().min(1).max(365).optional().default(30),
});

/**
 * Schema for asset-specific total supply output
 * Contains total supply history over time for a specific asset
 */
export const StatsTotalSupplyOutputSchema = z.object({
  /** Historical total supply data points for charting */
  totalSupplyHistory: z.array(
    z.object({
      timestamp: timestamp(),
      /** Total supply value as string (BigDecimal) */
      totalSupply: z.string(),
    })
  ),
});

/**
 * Type definition for asset-specific total supply input
 */
export type StatsTotalSupplyInput = z.infer<typeof StatsTotalSupplyInputSchema>;

/**
 * Type definition for asset-specific total supply output
 */
export type StatsTotalSupplyOutput = z.infer<
  typeof StatsTotalSupplyOutputSchema
>;

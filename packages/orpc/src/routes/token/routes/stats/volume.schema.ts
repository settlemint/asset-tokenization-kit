import { ethereumAddress } from "@atk/zod/validators/ethereum-address";
import { z } from "zod";

/**
 * Schema for asset-specific total volume input parameters
 */
export const StatsVolumeInputSchema = z.object({
  /** The token address for which to fetch total volume history */
  tokenAddress: ethereumAddress.describe("The token contract address"),

  /** Time range in days for historical data (default: 30 days) */
  days: z.number().min(1).max(365).optional().default(30),
});

/**
 * Schema for asset-specific total volume output
 * Contains total volume history over time for a specific asset
 */
export const StatsVolumeOutputSchema = z.object({
  /** Historical total volume data points for charting */
  volumeHistory: z.array(
    z.object({
      /** Unix timestamp for this data point */
      timestamp: z.number(),

      /** Total volume value as string (BigDecimal) */
      totalVolume: z.string(),
    })
  ),
});

/**
 * Type definition for asset-specific total volume input
 */
export type StatsVolumeInput = z.infer<typeof StatsVolumeInputSchema>;

/**
 * Type definition for asset-specific total volume output
 */
export type StatsVolumeOutput = z.infer<typeof StatsVolumeOutputSchema>;

import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { z } from "zod";

/**
 * Schema for asset-specific total transfers input parameters
 */
export const StatsTransfersInputSchema = z.object({
  /** The token address for which to fetch total transfers history */
  tokenAddress: ethereumAddress.describe("The token contract address"),

  /** Time range in days for historical data (default: 30 days) */
  days: z.number().min(1).max(365).optional().default(30),
});

/**
 * Schema for asset-specific total transfers output
 * Contains total transfers history over time for a specific asset
 */
export const StatsTransfersOutputSchema = z.object({
  /** Historical total transfers data points for charting */
  transfersHistory: z.array(
    z.object({
      /** Unix timestamp for this data point */
      timestamp: z.number(),

      /** Total transfers value as string (BigDecimal) */
      totalTransferred: z.string(),
    })
  ),
});

/**
 * Type definition for asset-specific total transfers input
 */
export type StatsTransfersInput = z.infer<typeof StatsTransfersInputSchema>;

/**
 * Type definition for asset-specific total transfers output
 */
export type StatsTransfersOutput = z.infer<typeof StatsTransfersOutputSchema>;
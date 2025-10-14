import { ethereumAddress } from "@atk/zod/ethereum-address";
import { timestamp } from "@atk/zod/timestamp";
import * as z from "zod";

/**
 * Schema for asset-specific supply changes input parameters
 */
export const StatsSupplyChangesInputSchema = z.object({
  /** The token address for which to fetch supply change history */
  tokenAddress: ethereumAddress.describe("The token contract address"),

  /** Time range in days for historical data (default: 30 days) */
  days: z.number().min(1).max(365).optional().default(30),
});

/**
 * Schema for asset-specific supply changes output
 * Contains minted and burned token history over time for a specific asset
 */
export const StatsSupplyChangesOutputSchema = z.object({
  /** Historical supply change data points for charting */
  supplyChangesHistory: z.array(
    z.object({
      timestamp: timestamp(),

      /** Total minted amount as string (BigDecimal) */
      totalMinted: z.string(),

      /** Total burned amount as string (BigDecimal) */
      totalBurned: z.string(),
    })
  ),
});

/**
 * Type definition for asset-specific supply changes input
 */
export type StatsSupplyChangesInput = z.infer<
  typeof StatsSupplyChangesInputSchema
>;

/**
 * Type definition for asset-specific supply changes output
 */
export type StatsSupplyChangesOutput = z.infer<
  typeof StatsSupplyChangesOutputSchema
>;

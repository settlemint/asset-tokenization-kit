import { z } from "zod";

/**
 * Schema for asset statistics output
 * Contains all asset-related metrics including counts, breakdowns, and activity data
 */
export const TokenStatsAssetsOutputSchema = z.object({
  /** Total number of tokenized assets across all types */
  totalAssets: z.number(),

  /** Breakdown of asset counts by type (e.g., { "bond": 5, "fund": 3 }) */
  assetBreakdown: z.record(z.string(), z.number()),

  /** Breakdown of total supply by asset type (e.g., { "bond": "1000000", "fund": "500000" }) */
  assetSupplyBreakdown: z.record(z.string(), z.string()),

  /** Detailed activity data for each asset type */
  assetActivity: z.array(
    z.object({
      /** Unique identifier for the asset type */
      id: z.string(),

      /** The type of asset (bond, fund, deposit, etc.) */
      assetType: z.string(),

      /** Number of mint events for this asset type */
      mintEventCount: z.number(),

      /** Number of burn events for this asset type */
      burnEventCount: z.number(),

      /** Number of transfer events for this asset type */
      transferEventCount: z.number(),

      /** Number of clawback events for this asset type */
      clawbackEventCount: z.number(),

      /** Number of freeze events for this asset type */
      frozenEventCount: z.number(),

      /** Number of unfreeze events for this asset type */
      unfrozenEventCount: z.number(),

      /** Total amount minted for this asset type (as string to preserve precision) */
      totalMinted: z.string(),

      /** Total amount burned for this asset type (as string to preserve precision) */
      totalBurned: z.string(),

      /** Total amount transferred for this asset type (as string to preserve precision) */
      totalTransferred: z.string(),
    })
  ),
});

/**
 * Type definition for asset statistics
 */
export type TokenStatsAssets = z.infer<typeof TokenStatsAssetsOutputSchema>;

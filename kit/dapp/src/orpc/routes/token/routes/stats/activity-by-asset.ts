import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { assetType } from "@/lib/zod/validators/asset-types";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { z } from "zod";

/**
 * GraphQL query to fetch activity data by asset type for bar charts
 * Optimized for the Asset Activity Chart specifically
 */
const ACTIVITY_BY_ASSET_QUERY = theGraphGraphql(`
  query ActivityByAsset {
    # Token statistics for asset type mapping
    tokenStatsStates {
      token {
        type
        symbol
        name
      }
    }

    # Event counts for different asset activities
    mintEvents: eventStats_collection(
      where: { eventName: "Mint" }
      interval: day
    ) {
      eventsCount
    }

    burnEvents: eventStats_collection(
      where: { eventName: "Burn" }
      interval: day
    ) {
      eventsCount
    }

    transferEvents: eventStats_collection(
      where: { eventName: "Transfer" }
      interval: day
    ) {
      eventsCount
    }

    clawbackEvents: eventStats_collection(
      where: { eventName: "Clawback" }
      interval: day
    ) {
      eventsCount
    }
  }
`);

// Schema for the GraphQL response
const ActivityByAssetResponseSchema = z.object({
  tokenStatsStates: z.array(
    z.object({
      token: z.object({
        type: assetType(),
        symbol: z.string(),
        name: z.string(),
      }),
    })
  ),
  mintEvents: z.array(z.object({ eventsCount: z.number() })),
  burnEvents: z.array(z.object({ eventsCount: z.number() })),
  transferEvents: z.array(z.object({ eventsCount: z.number() })),
  clawbackEvents: z.array(z.object({ eventsCount: z.number() })),
});

/**
 * Helper function to sum event counts from event stats
 */
function sumEventCounts(eventStats: { eventsCount: number }[]): number {
  return eventStats.reduce((total, stat) => total + stat.eventsCount, 0);
}

/**
 * Helper function to create asset activity data from token stats and event stats
 * Distributes event counts across asset types based on token count proportions
 */
function createAssetActivity(
  tokenStats: { token: { type: string } }[],
  eventStats: {
    mintEvents: { eventsCount: number }[];
    burnEvents: { eventsCount: number }[];
    transferEvents: { eventsCount: number }[];
    clawbackEvents: { eventsCount: number }[];
  }
): {
  assetType: string;
  mint: number;
  transfer: number;
  burn: number;
  clawback: number;
}[] {
  // Count tokens by asset type
  const assetTypeCounts = new Map<string, number>();
  for (const tokenStat of tokenStats) {
    const assetType = tokenStat.token.type;
    assetTypeCounts.set(assetType, (assetTypeCounts.get(assetType) ?? 0) + 1);
  }

  // Calculate total event counts
  const totalMint = sumEventCounts(eventStats.mintEvents);
  const totalBurn = sumEventCounts(eventStats.burnEvents);
  const totalTransfer = sumEventCounts(eventStats.transferEvents);
  const totalClawback = sumEventCounts(eventStats.clawbackEvents);

  const totalTokens = tokenStats.length;

  // Distribute events proportionally across asset types
  return [...assetTypeCounts.entries()]
    .filter(([, count]) => count > 0) // Only include asset types with tokens
    .map(([assetType, tokenCount]) => {
      // Calculate event share based on token count proportion
      const eventShare = totalTokens > 0 ? tokenCount / totalTokens : 0;

      return {
        assetType,
        mint: Math.floor(totalMint * eventShare),
        transfer: Math.floor(totalTransfer * eventShare),
        burn: Math.floor(totalBurn * eventShare),
        clawback: Math.floor(totalClawback * eventShare),
      };
    });
}

/**
 * Activity by asset route handler.
 *
 * Fetches asset activity data specifically for the Asset Activity Chart.
 * Returns event counts (mint, transfer, burn, clawback) by asset type for bar chart visualization.
 *
 * This endpoint is optimized for charts showing activity distribution by asset type.
 *
 * Authentication: Required
 * Method: GET /token/stats/activity-by-asset
 *
 * @returns Promise<ActivityByAssetMetrics> - Activity breakdown by asset type
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get activity data for bar chart
 * const activity = await orpc.token.statsActivityByAsset.query();
 * console.log('Activity:', activity.assetActivity);
 * ```
 */
export const statsActivityByAsset = authRouter.token.statsActivityByAsset
  .use(systemMiddleware)
  .use(theGraphMiddleware)
  .handler(async ({ context }) => {
    // System context is guaranteed by systemMiddleware

    // Fetch activity data
    const response = await context.theGraphClient.query(
      ACTIVITY_BY_ASSET_QUERY,
      {
        input: {},
        output: ActivityByAssetResponseSchema,
        error: context.t("tokens:api.stats.activityByAsset.messages.failed"),
      }
    );

    // Calculate asset activity
    const assetActivity = createAssetActivity(response.tokenStatsStates, {
      mintEvents: response.mintEvents,
      burnEvents: response.burnEvents,
      transferEvents: response.transferEvents,
      clawbackEvents: response.clawbackEvents,
    });

    return {
      assetActivity,
    };
  });

import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { createLogger, type LogLevel } from "@settlemint/sdk-utils/logging";
import { z } from "zod/v4";

const logger = createLogger({
  level: process.env.SETTLEMINT_LOG_LEVEL as LogLevel,
});

/**
 * GraphQL query to fetch all asset-related metrics in a single request
 * Combines token statistics and event counts for comprehensive asset data
 */
const ASSET_METRICS_QUERY = theGraphGraphql(`
  query AssetMetrics {
    # Token statistics for asset counts and supply breakdown
    tokenStatsStates {
      token {
        type
        totalSupply
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
    
    freezeEvents: eventStats_collection(
      where: { eventName: "Freeze" }
      interval: day
    ) {
      eventsCount
    }
    
    unfreezeEvents: eventStats_collection(
      where: { eventName: "Unfreeze" }
      interval: day
    ) {
      eventsCount
    }
  }
`);

// Schema for the GraphQL response
const AssetMetricsResponseSchema = z.object({
  tokenStatsStates: z.array(
    z.object({
      token: z.object({
        type: z.string(),
        totalSupply: z.string(),
        symbol: z.string(),
        name: z.string(),
      }),
    })
  ),
  mintEvents: z.array(z.object({ eventsCount: z.number() })),
  burnEvents: z.array(z.object({ eventsCount: z.number() })),
  transferEvents: z.array(z.object({ eventsCount: z.number() })),
  clawbackEvents: z.array(z.object({ eventsCount: z.number() })),
  freezeEvents: z.array(z.object({ eventsCount: z.number() })),
  unfreezeEvents: z.array(z.object({ eventsCount: z.number() })),
});

/**
 * Helper function to create asset breakdown from token stats
 * Counts tokens by type from tokenStatsStates
 */
function createAssetBreakdown(
  tokenStats: { token: { type: string } }[]
): Record<string, number> {
  const breakdown: Record<string, number> = {};

  for (const tokenStat of tokenStats) {
    const type = tokenStat.token.type;
    if (type) {
      breakdown[type] = (breakdown[type] ?? 0) + 1;
    }
  }

  return breakdown;
}

/**
 * Helper function to create asset supply breakdown from token stats
 * Sums total supply by asset type from tokenStatsStates
 */
function createAssetSupplyBreakdown(
  tokenStats: { token: { type: string; totalSupply: string } }[]
): Record<string, string> {
  const breakdown: Record<string, string> = {};

  for (const tokenStat of tokenStats) {
    const type = tokenStat.token.type;
    const supply = tokenStat.token.totalSupply;

    if (type && supply) {
      try {
        // Validate and convert supply values safely
        const currentSupplyStr = breakdown[type] ?? "0";
        const currentSupply = Number(currentSupplyStr);
        const newSupply = Number(supply);

        // Check for NaN values which indicate invalid input
        if (Number.isNaN(currentSupply) || Number.isNaN(newSupply)) {
          logger.warn("Invalid supply value encountered", {
            type,
            currentSupplyStr,
            supply,
          });
          continue;
        }

        breakdown[type] = (currentSupply + newSupply).toString();
      } catch (error) {
        logger.error("Error processing supply breakdown", {
          error,
          type,
          supply,
        });
        // Continue processing other tokens instead of failing completely
        continue;
      }
    }
  }

  return breakdown;
}

/**
 * Helper function to sum event counts from event stats
 */
function sumEventCounts(eventStats: { eventsCount: number }[]): number {
  return eventStats.reduce((total, stat) => total + stat.eventsCount, 0);
}

/**
 * Helper function to create asset activity data from token stats and event stats
 */
function createAssetActivity(
  tokenStats: { token: { type: string; totalSupply: string } }[],
  eventStats: {
    mintEvents: { eventsCount: number }[];
    burnEvents: { eventsCount: number }[];
    transferEvents: { eventsCount: number }[];
    clawbackEvents: { eventsCount: number }[];
    freezeEvents: { eventsCount: number }[];
    unfreezeEvents: { eventsCount: number }[];
  }
): {
  id: string;
  assetType: string;
  mintEventCount: number;
  burnEventCount: number;
  transferEventCount: number;
  clawbackEventCount: number;
  frozenEventCount: number;
  unfrozenEventCount: number;
  totalMinted: string;
  totalBurned: string;
  totalTransferred: string;
}[] {
  // Calculate total event counts
  const totalMintEvents = sumEventCounts(eventStats.mintEvents);
  const totalBurnEvents = sumEventCounts(eventStats.burnEvents);
  const totalTransferEvents = sumEventCounts(eventStats.transferEvents);
  const totalClawbackEvents = sumEventCounts(eventStats.clawbackEvents);
  const totalFreezeEvents = sumEventCounts(eventStats.freezeEvents);
  const totalUnfreezeEvents = sumEventCounts(eventStats.unfreezeEvents);

  // Group tokens by asset type and aggregate statistics
  const assetTypeMap = new Map<
    string,
    {
      mintEventCount: number;
      burnEventCount: number;
      transferEventCount: number;
      clawbackEventCount: number;
      frozenEventCount: number;
      unfrozenEventCount: number;
      totalMinted: bigint;
      totalBurned: bigint;
      totalTransferred: bigint;
      tokenCount: number;
    }
  >();

  // Process token statistics
  for (const tokenStat of tokenStats) {
    const assetType = tokenStat.token.type;

    const existing = assetTypeMap.get(assetType) ?? {
      mintEventCount: 0,
      burnEventCount: 0,
      transferEventCount: 0,
      clawbackEventCount: 0,
      frozenEventCount: 0,
      unfrozenEventCount: 0,
      totalMinted: BigInt(0),
      totalBurned: BigInt(0),
      totalTransferred: BigInt(0),
      tokenCount: 0,
    };

    // Count tokens for this asset type
    const newTokenCount = existing.tokenCount + 1;
    const totalTokensForType = tokenStats.filter(
      (ts) => ts.token.type === assetType
    ).length;

    // Distribute events proportionally based on this asset type's share of total tokens
    const eventShare =
      totalTokensForType > 0 ? totalTokensForType / tokenStats.length : 0;

    assetTypeMap.set(assetType, {
      mintEventCount: Math.floor(totalMintEvents * eventShare),
      burnEventCount: Math.floor(totalBurnEvents * eventShare),
      transferEventCount: Math.floor(totalTransferEvents * eventShare),
      clawbackEventCount: Math.floor(totalClawbackEvents * eventShare),
      frozenEventCount: Math.floor(totalFreezeEvents * eventShare),
      unfrozenEventCount: Math.floor(totalUnfreezeEvents * eventShare),
      totalMinted: existing.totalMinted,
      totalBurned: existing.totalBurned,
      totalTransferred: existing.totalTransferred,
      tokenCount: newTokenCount,
    });
  }

  // Convert to final array format
  return Array.from(assetTypeMap.entries()).map(([assetType, stats]) => ({
    id: assetType,
    assetType,
    mintEventCount: stats.mintEventCount,
    burnEventCount: stats.burnEventCount,
    transferEventCount: stats.transferEventCount,
    clawbackEventCount: stats.clawbackEventCount,
    frozenEventCount: stats.frozenEventCount,
    unfrozenEventCount: stats.unfrozenEventCount,
    totalMinted: stats.totalMinted.toString(),
    totalBurned: stats.totalBurned.toString(),
    totalTransferred: stats.totalTransferred.toString(),
  }));
}

/**
 * Asset statistics route handler.
 *
 * Fetches comprehensive asset-related metrics including:
 * - Total number of tokenized assets
 * - Breakdown of assets by type
 * - Total supply breakdown by asset type
 * - Detailed activity statistics for each asset type
 *
 * This endpoint is optimized for dashboard asset widgets and charts.
 *
 * Authentication: Required
 * Method: GET /token/stats/assets
 *
 * @returns Promise<AssetMetrics> - Comprehensive asset metrics
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 */
export const statsAssets = authRouter.token.statsAssets
  .use(systemMiddleware)
  .use(theGraphMiddleware)
  .handler(async ({ context, errors }) => {
    // Ensure system context exists
    if (!context.system) {
      throw errors.SYSTEM_NOT_CREATED();
    }

    // Fetch all asset-related data in a single query
    const response = await context.theGraphClient.query(ASSET_METRICS_QUERY, {
      input: {},
      output: AssetMetricsResponseSchema,
      error: "Failed to fetch asset metrics",
    });

    // Process the response data
    const assetBreakdown = createAssetBreakdown(response.tokenStatsStates);
    const assetSupplyBreakdown = createAssetSupplyBreakdown(
      response.tokenStatsStates
    );
    const totalAssets = response.tokenStatsStates.length;

    // Create asset activity data
    const assetActivity = createAssetActivity(response.tokenStatsStates, {
      mintEvents: response.mintEvents,
      burnEvents: response.burnEvents,
      transferEvents: response.transferEvents,
      clawbackEvents: response.clawbackEvents,
      freezeEvents: response.freezeEvents,
      unfreezeEvents: response.unfreezeEvents,
    });

    return {
      totalAssets,
      assetBreakdown,
      assetSupplyBreakdown,
      assetActivity,
    };
  });

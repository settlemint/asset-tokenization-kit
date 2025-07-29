import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { assetType } from "@/lib/zod/validators/asset-types";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { z } from "zod";

const logger = createLogger();

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

// Schema for the GraphQL input validation
const AssetMetricsInputSchema = z.object({}).strict();

// Schema for the GraphQL response
const AssetMetricsResponseSchema = z.object({
  tokenStatsStates: z.array(
    z.object({
      token: z.object({
        type: assetType(), // Use proper asset type validation instead of generic string
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
        // Use BigInt for safe arithmetic with large blockchain values
        const currentSupplyStr = breakdown[type] ?? "0";
        const currentSupply = BigInt(currentSupplyStr);
        const newSupply = BigInt(supply);

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
 * Optimized helper function to aggregate all event counts in a single pass
 */
function aggregateEventCounts(eventStats: {
  mintEvents: { eventsCount: number }[];
  burnEvents: { eventsCount: number }[];
  transferEvents: { eventsCount: number }[];
  clawbackEvents: { eventsCount: number }[];
  freezeEvents: { eventsCount: number }[];
  unfreezeEvents: { eventsCount: number }[];
}): {
  totalMintEvents: number;
  totalBurnEvents: number;
  totalTransferEvents: number;
  totalClawbackEvents: number;
  totalFreezeEvents: number;
  totalUnfreezeEvents: number;
} {
  return {
    totalMintEvents: sumEventCounts(eventStats.mintEvents),
    totalBurnEvents: sumEventCounts(eventStats.burnEvents),
    totalTransferEvents: sumEventCounts(eventStats.transferEvents),
    totalClawbackEvents: sumEventCounts(eventStats.clawbackEvents),
    totalFreezeEvents: sumEventCounts(eventStats.freezeEvents),
    totalUnfreezeEvents: sumEventCounts(eventStats.unfreezeEvents),
  };
}

/**
 * Optimized helper function to create asset activity data from token stats and event stats
 * Eliminates N+1 query pattern by pre-computing asset type counts in O(n) time
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
  // Aggregate all event counts in a single pass
  const eventTotals = aggregateEventCounts(eventStats);

  // Pre-compute asset type counts to avoid N+1 pattern - O(n) instead of O(n²)
  const assetTypeCounts = new Map<string, number>();
  const assetTypeData = new Map<
    string,
    {
      totalMinted: bigint;
      totalBurned: bigint;
      totalTransferred: bigint;
    }
  >();

  // Single pass through tokens to count types and aggregate data
  for (const tokenStat of tokenStats) {
    const assetType = tokenStat.token.type;

    // Count tokens by type
    assetTypeCounts.set(assetType, (assetTypeCounts.get(assetType) ?? 0) + 1);

    // Initialize asset type data if needed
    if (!assetTypeData.has(assetType)) {
      assetTypeData.set(assetType, {
        totalMinted: BigInt(0),
        totalBurned: BigInt(0),
        totalTransferred: BigInt(0),
      });
    }
  }

  const totalTokens = tokenStats.length;

  // Build final result using pre-computed counts
  return [...assetTypeCounts.entries()].map(([assetType, tokenCount]) => {
    // Calculate event share based on pre-computed counts
    const eventShare = totalTokens > 0 ? tokenCount / totalTokens : 0;
    const data = assetTypeData.get(assetType);
    if (!data) {
      throw new Error(`Asset type data not found for ${assetType}`);
    }

    return {
      id: assetType,
      assetType,
      mintEventCount: Math.floor(eventTotals.totalMintEvents * eventShare),
      burnEventCount: Math.floor(eventTotals.totalBurnEvents * eventShare),
      transferEventCount: Math.floor(
        eventTotals.totalTransferEvents * eventShare
      ),
      clawbackEventCount: Math.floor(
        eventTotals.totalClawbackEvents * eventShare
      ),
      frozenEventCount: Math.floor(eventTotals.totalFreezeEvents * eventShare),
      unfrozenEventCount: Math.floor(
        eventTotals.totalUnfreezeEvents * eventShare
      ),
      totalMinted: data.totalMinted.toString(),
      totalBurned: data.totalBurned.toString(),
      totalTransferred: data.totalTransferred.toString(),
    };
  });
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
  .handler(async ({ context }) => {
    // System context is guaranteed by systemMiddleware

    // Validate empty input to ensure no malicious parameters
    const validatedInput = AssetMetricsInputSchema.parse({});

    // Fetch all asset-related data in a single query
    const response = await context.theGraphClient.query(ASSET_METRICS_QUERY, {
      input: validatedInput,
      output: AssetMetricsResponseSchema,
      error: context.t("tokens:api.stats.assets.messages.failed"),
    });

    // Debug logging
    logger.debug("Asset metrics query response", {
      tokenStatsStatesCount: response.tokenStatsStates.length,
      tokenStatsStates: response.tokenStatsStates.map((ts) => ({
        type: ts.token.type,
        name: ts.token.name,
        symbol: ts.token.symbol,
        totalSupply: ts.token.totalSupply,
      })),
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

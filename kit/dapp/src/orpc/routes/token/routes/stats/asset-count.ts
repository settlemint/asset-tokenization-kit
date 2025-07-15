import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { assetType } from "@/lib/zod/validators/asset-types";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { z } from "zod";

/**
 * GraphQL query to fetch asset count and breakdown metrics
 * Optimized for the Asset Stats Widget specifically
 */
const ASSET_COUNT_QUERY = theGraphGraphql(`
  query AssetCount {
    tokenStatsStates {
      token {
        type
        symbol
        name
      }
    }
  }
`);

// Schema for the GraphQL response
const AssetCountResponseSchema = z.object({
  tokenStatsStates: z.array(
    z.object({
      token: z.object({
        type: assetType(),
        symbol: z.string(),
        name: z.string(),
      }),
    })
  ),
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
 * Asset count route handler.
 *
 * Fetches asset count metrics specifically for the Asset Stats Widget:
 * - Total number of tokenized assets
 * - Breakdown of assets by type (bond, equity, fund, etc.)
 *
 * This endpoint is optimized for displaying asset count summaries.
 *
 * Authentication: Required
 * Method: GET /token/stats/asset-count
 *
 * @returns Promise<AssetCountMetrics> - Asset count and breakdown metrics
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get asset count stats
 * const stats = await orpc.token.statsAssetCount.query();
 * console.log(`Total assets: ${stats.totalAssets}`);
 * console.log('Breakdown:', stats.assetBreakdown);
 * ```
 */
export const statsAssetCount = authRouter.token.statsAssetCount
  .use(systemMiddleware)
  .use(theGraphMiddleware)
  .handler(async ({ context }) => {
    // System context is guaranteed by systemMiddleware

    // Fetch asset count data in a single query
    const response = await context.theGraphClient.query(ASSET_COUNT_QUERY, {
      input: {},
      output: AssetCountResponseSchema,
      error: "Failed to fetch asset count",
    });

    // Calculate metrics
    const totalAssets = response.tokenStatsStates.length;
    const assetBreakdown = createAssetBreakdown(response.tokenStatsStates);

    return {
      totalAssets,
      assetBreakdown,
    };
  });

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
 * System asset count route handler.
 *
 * Fetches system-wide asset count metrics:
 * - Total number of tokenized assets in the system
 * - Breakdown of assets by type (bond, equity, fund, etc.)
 *
 * This endpoint is optimized for displaying system asset summaries.
 *
 * Authentication: Required
 * Method: GET /system/stats/assets
 *
 * @returns Promise<SystemAssetMetrics> - System asset count and breakdown metrics
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get system asset count stats
 * const stats = await orpc.system.statsAssets.query();
 * console.log(`Total assets: ${stats.totalAssets}`);
 * console.log('Breakdown:', stats.assetBreakdown);
 * ```
 */
export const statsAssets = authRouter.system.statsAssets
  .use(systemMiddleware)
  .use(theGraphMiddleware)
  .handler(async ({ context }) => {
    // System context is guaranteed by systemMiddleware

    // Fetch asset count data in a single query
    const response = await context.theGraphClient.query(ASSET_COUNT_QUERY, {
      input: {},
      output: AssetCountResponseSchema,
      error: context.t("tokens:api.stats.assetCount.messages.failed"),
    });

    // Calculate metrics
    const totalAssets = response.tokenStatsStates.length;
    const assetBreakdown = createAssetBreakdown(response.tokenStatsStates);

    return {
      totalAssets,
      assetBreakdown,
    };
  });

import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { systemRouter } from "@/orpc/procedures/system.router";
import { type AssetType, assetType } from "@atk/zod/asset-types";
import { z } from "zod";

/**
 * GraphQL query to fetch asset count and breakdown metrics
 * Optimized for the Asset Stats Widget specifically
 */
const ASSET_COUNT_QUERY = theGraphGraphql(`
  query ($systemAddress: Bytes!) {
    tokenTypeStatsStates(
      where: { system_: { id: $systemAddress } }
    ) {
      id
      type
      count
    }
  }
`);

// Schema for the GraphQL response
const AssetCountResponseSchema = z.object({
  tokenTypeStatsStates: z.array(
    z.object({
      id: z.string(),
      type: assetType(),
      count: z.number(),
    })
  ),
});

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

export const statsAssets = systemRouter.system.statsAssets
  .handler(async ({ context }) => {
    // System context is guaranteed by systemMiddleware
    const { system } = context;
    // Fetch asset count data in a single query
    const response = await context.theGraphClient.query(ASSET_COUNT_QUERY, {
      input: { systemAddress: system.address },
      output: AssetCountResponseSchema,
    });

    // Calculate metrics
    const totalAssets = response.tokenTypeStatsStates.reduce(
      (acc, curr) => acc + curr.count,
      0
    );
    const assetBreakdown = response.tokenTypeStatsStates.reduce<
      Record<AssetType, number>
    >(
      (acc, curr) => {
        acc[curr.type] = (acc[curr.type] ?? 0) + curr.count;
        return acc;
      },
      {
        bond: 0,
        equity: 0,
        fund: 0,
        stablecoin: 0,
        deposit: 0,
      }
    );

    return {
      totalAssets,
      assetBreakdown,
    };
  });

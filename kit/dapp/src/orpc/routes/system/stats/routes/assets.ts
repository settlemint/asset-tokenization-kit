import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { systemRouter } from "@/orpc/procedures/system.router";
import { type AssetType, assetType } from "@atk/zod/asset-types";
import { bigDecimal } from "@atk/zod/bigdecimal";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { BigDecimal } from "@atk/zod/src/bigdecimal";
import { from } from "dnum";
import { z } from "zod";

/**
 * GraphQL query to fetch asset count, value, and breakdown metrics
 * Optimized for the Asset Stats Widget and Value Distribution Chart
 */
const ASSET_COUNT_QUERY = theGraphGraphql(`
  query ($systemAddressId: ID!, $systemAddressBytes: Bytes!) {
    systemStatsState(id: $systemAddressId) {
      id
      tokensCreatedCount
      tokensLaunchedCount
      totalValueInBaseCurrency
    }
    tokenTypeStatsStates(
      where: { system_: { id: $systemAddressBytes } }
    ) {
      id
      type
      count
      totalValueInBaseCurrency
    }
  }
`);

// Schema for the GraphQL response
const AssetCountResponseSchema = z.object({
  systemStatsState: z
    .object({
      id: ethereumAddress,
      tokensCreatedCount: z.number(),
      tokensLaunchedCount: z.number(),
      totalValueInBaseCurrency: bigDecimal(),
    })
    .nullable(),
  tokenTypeStatsStates: z.array(
    z.object({
      id: z.string(),
      type: assetType(),
      count: z.number(),
      totalValueInBaseCurrency: bigDecimal(),
    })
  ),
});

/**
 * System asset count and value route handler.
 *
 * Fetches system-wide asset metrics:
 * - Total number of tokenized assets in the system
 * - Breakdown of assets by type (bond, equity, fund, etc.)
 * - Total value of all assets in base currency
 * - Value breakdown by asset type
 *
 * This endpoint is optimized for displaying system asset summaries
 * and value distribution visualizations.
 *
 * Authentication: Required
 * Method: GET /system/stats/assets
 *
 * @returns Promise<SystemAssetMetrics> - System asset count, value, and breakdown metrics
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get system asset stats
 * const stats = await orpc.system.stats.assets.query();
 * console.log(`Total assets: ${stats.totalAssets}`);
 * console.log('Count breakdown:', stats.assetBreakdown);
 * console.log(`Total value: ${stats.totalValue}`);
 * console.log('Value breakdown:', stats.valueBreakdown);
 * ```
 */

export const statsAssets = systemRouter.system.stats.assets.handler(
  async ({ context }) => {
    // System context is guaranteed by systemMiddleware
    const { system } = context;
    // Fetch asset count data in a single query
    const response = await context.theGraphClient.query(ASSET_COUNT_QUERY, {
      input: { systemAddressId: system.id, systemAddressBytes: system.id },
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

    const tokensCreatedCount =
      response.systemStatsState?.tokensCreatedCount ?? 0;
    const tokensLaunchedCount =
      response.systemStatsState?.tokensLaunchedCount ?? 0;
    const pendingLaunchesCount = tokensCreatedCount - tokensLaunchedCount;

    // Calculate total value and value breakdown (already parsed to Dnum by schema)
    const totalValue =
      response.systemStatsState?.totalValueInBaseCurrency ?? from(0);
    const valueBreakdown = response.tokenTypeStatsStates.reduce<
      Record<AssetType, BigDecimal>
    >(
      (acc, curr) => {
        acc[curr.type] = curr.totalValueInBaseCurrency;
        return acc;
      },
      {
        bond: from(0),
        equity: from(0),
        fund: from(0),
        stablecoin: from(0),
        deposit: from(0),
      }
    );

    return {
      totalAssets,
      assetBreakdown,
      totalValue,
      valueBreakdown,
      tokensCreatedCount,
      tokensLaunchedCount,
      pendingLaunchesCount,
    };
  }
);

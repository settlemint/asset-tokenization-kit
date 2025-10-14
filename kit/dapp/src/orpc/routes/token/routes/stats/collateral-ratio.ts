import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { bigDecimal } from "@atk/zod/bigdecimal";
import { divide, greaterThan, multiply, toNumber } from "dnum";
import * as z from "zod";

/**
 * GraphQL query to fetch token collateral statistics from subgraph
 * Retrieves the latest collateral data for the token
 */
const TOKEN_COLLATERAL_STATS_QUERY = theGraphGraphql(`
  query TokenCollateralStats($tokenId: String!) {
    tokenCollateralStatsDatas(
      where: { token: $tokenId }
      orderBy: timestamp
      orderDirection: desc
      first: 1
    ) {
      collateral
      collateralAvailable
      collateralUsed
    }
  }
`);

// Schema for the GraphQL response
const TokenCollateralStatsResponseSchema = z.object({
  tokenCollateralStatsDatas: z.array(
    z.object({
      collateral: bigDecimal(),
      collateralAvailable: bigDecimal(),
      collateralUsed: bigDecimal(),
    })
  ),
});

/**
 * Collateral ratio statistics route handler.
 *
 * Fetches collateral ratio data for stablecoins and tokenized deposits,
 * showing the breakdown between available and used collateral.
 * The collateral ratio indicates how much of the total collateral
 * is currently backing issued tokens.
 *
 * Authentication: Required
 * Permissions: Requires "read" permission on the specific token
 * Method: GET /token/stats/{tokenAddress}/collateral-ratio
 *
 * @param input.tokenAddress - The token contract address to query
 * @returns Promise<StatsCollateralRatioOutput> - Collateral buckets and ratios
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required read permissions on the token
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get collateral ratio for a stablecoin
 * const collateralData = await orpc.token.statsCollateralRatio.query({
 *   input: { tokenAddress: '0x1234...' }
 * });
 * console.log(collateralData.buckets);
 * console.log(`Collateral ratio: ${collateralData.collateralRatio}%`);
 * ```
 */
export const statsCollateralRatio =
  tokenRouter.token.statsCollateralRatio.handler(async ({ context, input }) => {
    // Token context is guaranteed by tokenRouter middleware

    // Fetch latest collateral stats from TheGraph
    const response = await context.theGraphClient.query(
      TOKEN_COLLATERAL_STATS_QUERY,
      {
        input: {
          tokenId: input.tokenAddress.toLowerCase(),
        },
        output: TokenCollateralStatsResponseSchema,
      }
    );

    const stats = response.tokenCollateralStatsDatas[0];

    // Handle case where no collateral data exists
    if (!stats) {
      return {
        buckets: [
          { name: "collateralAvailable", value: 0 },
          { name: "collateralUsed", value: 0 },
        ],
        totalCollateral: 0,
        collateralRatio: 0,
      };
    }

    // Build collateral buckets
    const buckets = [
      {
        name: "collateralAvailable",
        value: toNumber(stats.collateralAvailable),
      },
      { name: "collateralUsed", value: toNumber(stats.collateralUsed) },
    ];

    // Calculate collateral ratio (used/total * 100)
    const collateralRatio = greaterThan(stats.collateral, 0)
      ? // Accurate to 1 decimal
        toNumber(
          multiply(divide(stats.collateralUsed, stats.collateral, 3), 100, 1)
        )
      : 0;

    return {
      buckets,
      totalCollateral: toNumber(stats.collateral),
      collateralRatio,
    };
  });

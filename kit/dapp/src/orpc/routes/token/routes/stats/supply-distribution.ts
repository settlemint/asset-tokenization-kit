import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { assetType } from "@/lib/zod/validators/asset-types";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { z } from "zod";

const logger = createLogger();

/**
 * GraphQL query to fetch supply distribution data for pie charts
 * Optimized for the Asset Supply Chart specifically
 */
const SUPPLY_DISTRIBUTION_QUERY = theGraphGraphql(`
  query SupplyDistribution {
    tokenStatsStates {
      token {
        type
        totalSupply
        symbol
        name
      }
    }
  }
`);

// Schema for the GraphQL response
const SupplyDistributionResponseSchema = z.object({
  tokenStatsStates: z.array(
    z.object({
      token: z.object({
        type: assetType(),
        totalSupply: z.string(),
        symbol: z.string(),
        name: z.string(),
      }),
    })
  ),
});

/**
 * Helper function to create asset supply distribution from token stats
 * Sums total supply by asset type for pie chart visualization
 */
function createSupplyDistribution(
  tokenStats: { token: { type: string; totalSupply: string } }[]
): { assetType: string; totalSupply: string }[] {
  const breakdown: Record<string, bigint> = {};

  for (const tokenStat of tokenStats) {
    const type = tokenStat.token.type;
    const supply = tokenStat.token.totalSupply;

    if (type && supply) {
      try {
        // Use BigInt for safe arithmetic with large blockchain values
        const currentSupply = breakdown[type] ?? BigInt(0);
        const newSupply = BigInt(supply);

        breakdown[type] = currentSupply + newSupply;
      } catch (error) {
        logger.error("Error processing supply distribution", {
          error,
          type,
          supply,
        });
        // Continue processing other tokens instead of failing completely
        continue;
      }
    }
  }

  // Convert to array format for chart consumption, filtering out zero supplies
  return Object.entries(breakdown)
    .filter(([, supply]) => supply > BigInt(0))
    .map(([assetType, supply]) => ({
      assetType,
      totalSupply: supply.toString(),
    }));
}

/**
 * Supply distribution route handler.
 *
 * Fetches asset supply distribution data specifically for the Asset Supply Chart.
 * Returns the total supply breakdown by asset type for pie chart visualization.
 *
 * This endpoint is optimized for charts showing supply distribution.
 *
 * Authentication: Required
 * Method: GET /token/stats/supply-distribution
 *
 * @returns Promise<SupplyDistributionMetrics> - Supply distribution by asset type
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get supply distribution for pie chart
 * const distribution = await orpc.token.statsSupplyDistribution.query();
 * console.log('Distribution:', distribution.supplyDistribution);
 * ```
 */
export const supplyDistribution = authRouter.token.statsSupplyDistribution
  .use(systemMiddleware)
  .use(theGraphMiddleware)
  .handler(async ({ context }) => {
    // System context is guaranteed by systemMiddleware

    // Fetch supply distribution data
    const response = await context.theGraphClient.query(
      SUPPLY_DISTRIBUTION_QUERY,
      {
        input: {},
        output: SupplyDistributionResponseSchema,
        error: "Failed to fetch supply distribution",
      }
    );

    // Calculate supply distribution
    const supplyDistribution = createSupplyDistribution(
      response.tokenStatsStates
    );

    return {
      supplyDistribution,
    };
  });

import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { tokenRouter } from "@/orpc/procedures/token.router";
import * as z from "zod";

/**
 * GraphQL query to fetch token distribution statistics from subgraph
 * Retrieves pre-calculated distribution segments and holder counts
 */
const TOKEN_DISTRIBUTION_STATS_QUERY = theGraphGraphql(`
  query TokenDistributionStats($tokenId: ID!) {
    tokenDistributionStatsState(id: $tokenId) {
      balancesCountSegment1
      balancesCountSegment2
      balancesCountSegment3
      balancesCountSegment4
      balancesCountSegment5
    }
  }
`);

// Schema for the GraphQL response
const TokenDistributionStatsResponseSchema = z.object({
  tokenDistributionStatsState: z
    .object({
      balancesCountSegment1: z.number(),
      balancesCountSegment2: z.number(),
      balancesCountSegment3: z.number(),
      balancesCountSegment4: z.number(),
      balancesCountSegment5: z.number(),
    })
    .nullable(),
});

/**
 * Wallet distribution statistics route handler.
 *
 * Fetches wallet distribution data for a specific token showing how many wallets
 * hold different amounts of tokens. The distribution is divided into 5 dynamic
 * buckets based on percentages of the maximum balance:
 * - 0-2% of max balance
 * - 2-10% of max balance
 * - 10-20% of max balance
 * - 20-40% of max balance
 * - 40-100% of max balance
 *
 * This endpoint is optimized for wallet distribution charts and holder analysis.
 *
 * Authentication: Required
 * Permissions: Requires "read" permission on the specific token
 * Method: GET /token/stats/{tokenAddress}/wallet-distribution
 *
 * @param input.tokenAddress - The token contract address to query
 * @returns Promise<StatsWalletDistributionOutput> - Distribution buckets and total holders
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required read permissions on the token
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get wallet distribution for a token
 * const distribution = await orpc.token.statsWalletDistribution.query({
 *   input: { tokenAddress: '0x1234...' }
 * });
 * console.log(distribution.buckets);
 * console.log(`Total holders: ${distribution.totalHolders}`);
 * ```
 */
export const statsWalletDistribution =
  tokenRouter.token.statsWalletDistribution.handler(
    async ({ context, input }) => {
      // Token context is guaranteed by tokenRouter middleware

      // Fetch pre-calculated distribution stats from TheGraph
      const response = await context.theGraphClient.query(
        TOKEN_DISTRIBUTION_STATS_QUERY,
        {
          input: {
            tokenId: input.tokenAddress.toLowerCase(),
          },
          output: TokenDistributionStatsResponseSchema,
        }
      );

      const stats = response.tokenDistributionStatsState;

      // Convert subgraph segments to API response format (handles null case with ??)
      const buckets = [
        { range: "0-2%", count: stats?.balancesCountSegment1 ?? 0 },
        { range: "2-10%", count: stats?.balancesCountSegment2 ?? 0 },
        { range: "10-20%", count: stats?.balancesCountSegment3 ?? 0 },
        { range: "20-40%", count: stats?.balancesCountSegment4 ?? 0 },
        { range: "40-100%", count: stats?.balancesCountSegment5 ?? 0 },
      ];

      return {
        buckets,
        totalHolders: buckets.reduce((sum, bucket) => sum + bucket.count, 0),
      };
    }
  );

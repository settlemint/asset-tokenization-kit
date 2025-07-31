import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { z } from "zod";
import { type StatsWalletDistributionOutput } from "./wallet-distribution.schema";

/**
 * GraphQL query to fetch token balances for wallet distribution calculation
 * Retrieves all non-zero balances for a specific token
 */
const TOKEN_BALANCES_QUERY = theGraphGraphql(`
  query TokenBalancesForDistribution($tokenId: ID!) {
    token(id: $tokenId) {
      balances(where: { value_gt: "0" }) {
        value
        account {
          id
        }
      }
    }
  }
`);

// Schema for the GraphQL response
const TokenBalancesResponseSchema = z.object({
  token: z
    .object({
      balances: z.array(
        z.object({
          value: z.string(),
          account: z.object({
            id: z.string(),
          }),
        })
      ),
    })
    .nullable(),
});

/**
 * Helper function to create dynamic distribution buckets based on percentage ranges
 * Creates 5 buckets: 0-2%, 2-10%, 10-20%, 20-40%, 40-100% of max value
 *
 * @param balances - Array of balance values as strings
 * @returns Array of distribution buckets with ranges and counts
 */
function createDistributionBuckets(
  balances: { value: string; account: { id: string } }[]
): StatsWalletDistributionOutput {
  if (balances.length === 0) {
    return { buckets: [], totalHolders: 0 };
  }

  // Convert string values to BigInt and sort by value
  const sortedBalances = balances
    .map((balance) => ({
      value: BigInt(balance.value.split(".")[0] ?? "0"),
      account: balance.account.id,
    }))
    .filter((b) => b.value > 0n) // Ensure only positive values
    .sort((a, b) => (a.value > b.value ? -1 : a.value < b.value ? 1 : 0));

  if (sortedBalances.length === 0) {
    return { buckets: [], totalHolders: 0 };
  }

  // Calculate the maximum value
  const maxValue = sortedBalances[0]?.value ?? 0n;

  // Create 5 ranges from 0 to maxValue using percentages
  const ranges = [
    0n,
    (maxValue * 2n) / 100n, // 2% of max
    (maxValue * 10n) / 100n, // 10% of max
    (maxValue * 20n) / 100n, // 20% of max
    (maxValue * 40n) / 100n, // 40% of max
    maxValue, // 100% of max
  ];

  // Create buckets for each range
  const buckets: { range: string; count: number }[] = [];

  for (let i = 0; i < ranges.length - 1; i++) {
    const minValue = ranges[i];
    const maxValue = ranges[i + 1];

    // Skip if values are undefined (shouldn't happen with fixed ranges)
    if (minValue === undefined || maxValue === undefined) {
      continue;
    }

    // Count holders that fall within this specific range
    const count = sortedBalances.filter((b) => {
      if (i === ranges.length - 2) {
        // Last bucket includes values equal to max
        return b.value >= minValue && b.value <= maxValue;
      }
      return b.value >= minValue && b.value < maxValue;
    }).length;

    buckets.push({
      range: `${minValue.toString()}-${maxValue.toString()}`,
      count,
    });
  }

  return {
    buckets,
    totalHolders: sortedBalances.length,
  };
}

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
export const statsWalletDistribution = tokenRouter.token.statsWalletDistribution
  .use(theGraphMiddleware)
  .handler(async ({ context, input }) => {
    // Token context is guaranteed by tokenRouter middleware

    // Fetch token balances from TheGraph
    const response = await context.theGraphClient.query(TOKEN_BALANCES_QUERY, {
      input: {
        tokenId: input.tokenAddress.toLowerCase(),
      },
      output: TokenBalancesResponseSchema,
      error: "Failed to fetch token balance distribution",
    });

    // Process the balances into distribution buckets
    const { buckets, totalHolders } = createDistributionBuckets(
      response.token?.balances || []
    );

    return {
      buckets,
      totalHolders,
    };
  });

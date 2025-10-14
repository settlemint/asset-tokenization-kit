import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { format, from } from "dnum";
import * as z from "zod";

/**
 * GraphQL query to fetch yield schedule and period data for a bond token
 * Retrieves all periods with their yield generation and claim statistics
 */
const TOKEN_YIELD_DISTRIBUTION_QUERY = theGraphGraphql(`
  query TokenYieldDistribution($tokenId: ID!) {
    token(id: $tokenId) {
      id
      yield_ {
        schedule {
          id
          startDate
          endDate
          rate
          interval
          totalClaimed
          totalClaimedExact
          totalUnclaimedYield
          totalUnclaimedYieldExact
          totalYield
          totalYieldExact
          denominationAsset {
            id
            decimals
          }
          periods(orderBy: startDate, orderDirection: asc) {
            id
            startDate
            endDate
            totalClaimed
            totalClaimedExact
            totalUnclaimedYield
            totalUnclaimedYieldExact
            totalYield
            totalYieldExact
          }
        }
      }
    }
  }
`);

// Schema for the GraphQL response
const TokenYieldDistributionResponseSchema = z.object({
  token: z.object({
    id: z.string(),
    yield_: z
      .object({
        schedule: z
          .object({
            id: z.string(),
            startDate: z.string(),
            endDate: z.string(),
            rate: z.string(),
            interval: z.string(),
            totalClaimed: z.string(),
            totalClaimedExact: z.string(),
            totalUnclaimedYield: z.string(),
            totalUnclaimedYieldExact: z.string(),
            totalYield: z.string(),
            totalYieldExact: z.string(),
            denominationAsset: z.object({
              id: z.string(),
              decimals: z.number(),
            }),
            periods: z.array(
              z.object({
                id: z.string(),
                startDate: z.string(),
                endDate: z.string(),
                totalClaimed: z.string(),
                totalClaimedExact: z.string(),
                totalUnclaimedYield: z.string(),
                totalUnclaimedYieldExact: z.string(),
                totalYield: z.string(),
                totalYieldExact: z.string(),
              })
            ),
          })
          .nullable(),
      })
      .nullable(),
  }),
});

/**
 * Yield distribution statistics route handler.
 *
 * Fetches yield distribution data for a bond token showing how yields have been
 * generated and claimed over time. The distribution is divided into periods based
 * on the bond's yield schedule configuration. Each period shows:
 * - Total yield generated
 * - Yield claimed by holders
 * - Unclaimed yield remaining
 *
 * This endpoint is optimized for yield distribution charts showing yield trends over time.
 *
 * Authentication: Required
 * Permissions: Requires "read" permission on the specific token
 * Method: GET /token/stats/{tokenAddress}/yield-distribution
 *
 * @param input.tokenAddress - The bond token contract address to query
 * @returns Promise<StatsYieldDistributionOutput> - Time-series yield data
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required read permissions on the token
 * @throws NOT_FOUND - If token is not a bond or has no yield schedule
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get yield distribution for a bond
 * const distribution = await orpc.token.statsYieldDistribution.query({
 *   input: { tokenAddress: '0x1234...' }
 * });
 * console.log(distribution.periods);
 * console.log(`Total yield: ${distribution.totalYield}`);
 * ```
 */
export const statsYieldDistribution =
  tokenRouter.token.statsYieldDistribution.handler(
    async ({ context, input }) => {
      // Token context is guaranteed by tokenRouter middleware
      const { tokenAddress } = input;

      // Fetch yield schedule data from TheGraph
      const response = await context.theGraphClient.query(
        TOKEN_YIELD_DISTRIBUTION_QUERY,
        {
          input: {
            tokenId: tokenAddress.toLowerCase(),
          },
          output: TokenYieldDistributionResponseSchema,
        }
      );

      // Check if yield schedule exists
      const schedule = response.token.yield_?.schedule;
      if (!schedule) {
        // Return empty data if no yield schedule found (token might not be a bond)
        return {
          periods: [],
          totalYield: from(0),
          totalClaimed: from(0),
          totalUnclaimed: from(0),
        };
      }

      const decimals = schedule.denominationAsset.decimals;

      // Transform periods into distribution format
      const periods = schedule.periods.map((period) => {
        const totalYield = from(period.totalYieldExact, decimals);
        const claimed = from(period.totalClaimedExact, decimals);
        const unclaimed = from(period.totalUnclaimedYieldExact, decimals);

        return {
          id: period.id,
          // Convert to milliseconds for JavaScript Date compatibility
          timestamp: Number(period.startDate) * 1000,
          totalYield: Number(format(totalYield)),
          claimed: Number(format(claimed)),
          unclaimed: Number(format(unclaimed)),
        };
      });

      // Return distribution data with totals as bigDecimal (Dnum)
      return {
        periods,
        totalYield: from(schedule.totalYieldExact, decimals),
        totalClaimed: from(schedule.totalClaimedExact, decimals),
        totalUnclaimed: from(schedule.totalUnclaimedYieldExact, decimals),
      };
    }
  );

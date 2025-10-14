import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { from } from "dnum";
import * as z from "zod";

/**
 * GraphQL query to fetch bond data needed for yield coverage calculation
 * Retrieves yield schedule information and denomination asset balance
 */
const TOKEN_YIELD_COVERAGE_QUERY = theGraphGraphql(`
  query TokenYieldCoverage($tokenId: ID!) {
    token(id: $tokenId) {
      id
      bond {
        stats {
          denominationAssetBalanceAvailable
        }
      }
      yield_ {
        schedule {
          id
          startDate
          endDate
          totalUnclaimedYield
          totalUnclaimedYieldExact
          denominationAsset {
            id
            decimals
          }
        }
      }
    }
  }
`);

// Schema for the GraphQL response
const TokenYieldCoverageResponseSchema = z.object({
  token: z.object({
    id: z.string(),
    bond: z
      .object({
        stats: z
          .object({
            denominationAssetBalanceAvailable: z.string(),
          })
          .nullable(),
      })
      .nullable(),
    yield_: z
      .object({
        schedule: z
          .object({
            id: z.string(),
            startDate: z.string(),
            endDate: z.string(),
            totalUnclaimedYield: z.string(),
            totalUnclaimedYieldExact: z.string(),
            denominationAsset: z.object({
              id: z.string(),
              decimals: z.number(),
            }),
          })
          .nullable(),
      })
      .nullable(),
  }),
});

/**
 * Yield coverage statistics route handler.
 *
 * Calculates what percentage of unclaimed yield is covered by the underlying
 * denomination asset balance. The coverage calculation helps assess the bond's
 * ability to fulfill yield payments:
 *
 * - 0-99%: Insufficient coverage (critical)
 * - 100-199%: Covers current unclaimed yield (adequate)
 * - 200%+: Covers current and future yields (excellent)
 *
 * This endpoint provides essential risk assessment data for bond yield sustainability.
 *
 * Authentication: Required
 * Permissions: Requires "read" permission on the specific token
 * Method: GET /token/stats/{tokenAddress}/yield-coverage
 *
 * @param input.tokenAddress - The bond token contract address to query
 * @returns Promise<StatsYieldCoverageOutput> - Coverage percentage and status
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required read permissions on the token
 * @throws NOT_FOUND - If token is not a bond
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get yield coverage for risk assessment
 * const coverage = await orpc.token.statsYieldCoverage.query({
 *   input: { tokenAddress: '0x1234...' }
 * });
 *
 * if (coverage.yieldCoverage < 100) {
 *   console.warn('Insufficient yield coverage');
 * }
 * ```
 */
export const statsYieldCoverage = tokenRouter.token.statsYieldCoverage.handler(
  async ({ context, input }) => {
    // Token context is guaranteed by tokenRouter middleware
    const { tokenAddress } = input;

    // Fetch yield coverage data from TheGraph
    const response = await context.theGraphClient.query(
      TOKEN_YIELD_COVERAGE_QUERY,
      {
        input: {
          tokenId: tokenAddress.toLowerCase(),
        },
        output: TokenYieldCoverageResponseSchema,
      }
    );

    const token = response.token;
    const yieldSchedule = token.yield_?.schedule;
    const bondStats = token.bond?.stats;

    // Check if bond has a yield schedule
    if (!yieldSchedule) {
      return {
        yieldCoverage: 0,
        hasYieldSchedule: false,
        isRunning: false,
        totalUnclaimedYield: from(0),
        denominationAssetBalance: from(0),
      };
    }

    // Check if yield schedule is currently active
    const now = Math.floor(Date.now() / 1000); // Convert to seconds
    const startDate = Number(yieldSchedule.startDate);
    const endDate = Number(yieldSchedule.endDate);
    const isRunning = now >= startDate && now <= endDate;

    const decimals = yieldSchedule.denominationAsset.decimals;

    // Get unclaimed yield and denomination asset balance
    const totalUnclaimedYield = from(
      yieldSchedule.totalUnclaimedYieldExact,
      decimals
    );
    const denominationAssetBalance = from(
      bondStats?.denominationAssetBalanceAvailable || "0",
      decimals
    );

    // Calculate coverage percentage
    // Coverage = (denomination asset balance / unclaimed yield) * 100
    let yieldCoverage = 0;
    const unclaimedAmount = Number(yieldSchedule.totalUnclaimedYield);
    const availableBalance = Number(
      bondStats?.denominationAssetBalanceAvailable || "0"
    );

    if (unclaimedAmount > 0) {
      yieldCoverage = (availableBalance / unclaimedAmount) * 100;
    } else if (availableBalance > 0) {
      // If no unclaimed yield but there's balance, coverage is effectively infinite
      yieldCoverage = Number.POSITIVE_INFINITY;
    }

    return {
      yieldCoverage: Number.isFinite(yieldCoverage) ? yieldCoverage : 0,
      hasYieldSchedule: true,
      isRunning,
      totalUnclaimedYield,
      denominationAssetBalance,
    };
  }
);

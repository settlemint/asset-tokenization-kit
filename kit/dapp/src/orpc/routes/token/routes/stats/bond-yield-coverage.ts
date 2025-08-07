import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { from } from "dnum";
import { z } from "zod";

/**
 * GraphQL query to fetch bond yield coverage statistics for a specific token
 * Retrieves yield information and coverage data
 */
const TOKEN_BOND_YIELD_COVERAGE_QUERY = theGraphGraphql(`
  query TokenBondYieldCoverage($tokenId: ID!) {
    token(id: $tokenId) {
      id
      bond {
        stats {
          coveredPercentage
        }
      }
      yield_ {
        id
      }
    }
  }
`);

// Schema for the GraphQL response
const StatsBondYieldCoverageResponseSchema = z.object({
  token: z.object({
    id: z.string(),
    bond: z
      .object({
        stats: z
          .object({
            coveredPercentage: z.string().nullable(),
          })
          .nullable(),
      })
      .nullable(),
    yield_: z
      .object({
        id: z.string(),
      })
      .nullable(),
  }),
});

/**
 * Bond yield coverage statistics route handler.
 *
 * Fetches yield coverage information including:
 * - Current coverage percentage (available / required * 100)
 * - Yield schedule existence
 * - Whether yield schedule is currently running
 *
 * This endpoint is optimized for bond yield coverage gauge charts.
 *
 * Authentication: Required
 * Permissions: Requires "read" permission on the specific token
 * Method: GET /token/stats/{tokenAddress}/bond-yield-coverage
 *
 * @param input.tokenAddress - The bond token contract address to query
 * @returns Promise<StatsBondYieldCoverageOutput> - Bond yield coverage statistics
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required read permissions on the token
 * @throws NOT_FOUND - If token is not a bond
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get bond yield coverage for chart display
 * const yieldCoverage = await orpc.token.statsBondYieldCoverage.query({
 *   input: { tokenAddress: '0x1234...' }
 * });
 * console.log(`Coverage: ${yieldCoverage.yieldCoverage}%`);
 * ```
 */
export const statsBondYieldCoverage = tokenRouter.token.statsBondYieldCoverage
  .use(theGraphMiddleware)
  .handler(async ({ context, input }) => {
    // Token context is guaranteed by tokenRouter middleware
    const { tokenAddress } = input;

    // Fetch bond yield coverage from TheGraph
    const response = await context.theGraphClient.query(
      TOKEN_BOND_YIELD_COVERAGE_QUERY,
      {
        input: {
          tokenId: tokenAddress.toLowerCase(),
        },
        output: StatsBondYieldCoverageResponseSchema,
      }
    );

    // Check if yield extension exists and has a valid schedule
    // A valid schedule means yield_ exists and its ID is not Address.zero()
    const yieldExtension = response.token.yield_;
    const hasYieldSchedule =
      !!yieldExtension &&
      yieldExtension.id !== "0x0000000000000000000000000000000000000000";

    // Since we don't have schedule dates anymore, we can't determine if it's running
    // For now, return false - this could be enhanced with a separate query if needed
    const isRunning = false;

    // Get coverage percentage from bond stats with proper validation
    const bondStats = response.token.bond?.stats;
    const rawCoverage = bondStats?.coveredPercentage;

    // Validate and sanitize coverage percentage
    let yieldCoverage = from(0);
    if (rawCoverage && rawCoverage.trim() !== "") {
      try {
        const coverageValue = from(rawCoverage);
        // Ensure non-negative value - negative coverage doesn't make business sense
        yieldCoverage = coverageValue[0] >= 0n ? coverageValue : from(0);
      } catch {
        // Invalid number format - default to 0
        yieldCoverage = from(0);
      }
    }

    return {
      hasYieldSchedule,
      isRunning,
      yieldCoverage,
    };
  });

import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { from } from "dnum";
import * as z from "zod";

/**
 * GraphQL query to fetch bond status statistics for a specific token
 * Retrieves denomination asset balance information needed for bond status calculations
 */
const TOKEN_BOND_STATUS_QUERY = theGraphGraphql(`
  query TokenBondStatus($tokenId: ID!) {
    token(id: $tokenId) {
      id
      bond {
        stats {
          denominationAssetBalanceAvailable
          denominationAssetBalanceRequired
          coveredPercentage
        }
      }
    }
  }
`);

// Schema for the GraphQL response
const StatsBondStatusResponseSchema = z.object({
  token: z.object({
    id: z.string(),
    bond: z
      .object({
        stats: z
          .object({
            denominationAssetBalanceAvailable: z.string(),
            denominationAssetBalanceRequired: z.string(),
            coveredPercentage: z.string(),
          })
          .nullable(),
      })
      .nullable(),
  }),
});

/**
 * Bond status statistics route handler.
 *
 * Fetches current bond status including denomination asset balance information:
 * - Current available denomination asset balance for redemption
 * - Total denomination asset balance required for full redemption
 * - Coverage percentage (available / required * 100)
 *
 * This endpoint is optimized for bond status progress charts and widgets.
 *
 * Authentication: Required
 * Permissions: Requires "read" permission on the specific token
 * Method: GET /token/stats/{tokenAddress}/bond-status
 *
 * @param input.tokenAddress - The bond token contract address to query
 * @returns Promise<StatsBondStatusOutput> - Current bond status statistics
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required read permissions on the token
 * @throws NOT_FOUND - If token is not a bond or has no bond stats
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get bond status for redemption progress
 * const bondStatus = await orpc.token.statsBondStatus.query({
 *   input: { tokenAddress: '0x1234...' }
 * });
 * console.log(`Coverage: ${bondStatus.coveredPercentage}%`);
 * ```
 */
export const statsBondStatus = tokenRouter.token.statsBondStatus.handler(
  async ({ context, input }) => {
    // Token context is guaranteed by tokenRouter middleware
    const { tokenAddress } = input;

    // Fetch bond status from TheGraph
    const response = await context.theGraphClient.query(
      TOKEN_BOND_STATUS_QUERY,
      {
        input: {
          tokenId: tokenAddress.toLowerCase(),
        },
        output: StatsBondStatusResponseSchema,
      }
    );

    // Check if bond stats exist
    const bondStats = response.token.bond?.stats;
    if (!bondStats) {
      // Return zeros if no bond stats found (token might not be a bond or no stats yet)
      return {
        denominationAssetBalanceAvailable: from(0),
        denominationAssetBalanceRequired: from(0),
        coveredPercentage: from(0),
      };
    }

    // Convert string values to dnum for precise arithmetic
    return {
      denominationAssetBalanceAvailable: from(
        bondStats.denominationAssetBalanceAvailable
      ),
      denominationAssetBalanceRequired: from(
        bondStats.denominationAssetBalanceRequired
      ),
      coveredPercentage: from(bondStats.coveredPercentage),
    };
  }
);

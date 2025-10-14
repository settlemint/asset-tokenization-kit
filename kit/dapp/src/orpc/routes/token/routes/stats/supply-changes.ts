import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { timestamp } from "@atk/zod/timestamp";
import * as z from "zod";

/**
 * GraphQL query to fetch token-specific minted and burned history
 * Retrieves historical supply change data for a specific token
 */
const TOKEN_SUPPLY_CHANGES_QUERY = theGraphGraphql(`
  query TokenSupplyChangesHistory($tokenId: String!, $since: Timestamp!) {
    tokenStats_collection(
      where: { token: $tokenId, timestamp_gte: $since }
      interval: day
      orderBy: timestamp
      orderDirection: asc
    ) {
      timestamp
      totalMinted
      totalBurned
    }
  }
`);

// Schema for the GraphQL response
const TokenSupplyChangesResponseSchema = z.object({
  tokenStats_collection: z.array(
    z.object({
      timestamp: timestamp(),
      totalMinted: z.string(),
      totalBurned: z.string(),
    })
  ),
});

/**
 * Asset-specific supply changes history route handler.
 *
 * Fetches comprehensive minted and burned token history for a specific asset including:
 * - Historical minted amounts over the specified time range
 * - Historical burned amounts over the specified time range
 * - Data optimized for charting supply changes and token activity
 *
 * This endpoint is optimized for dashboard supply change widgets and historical charts.
 *
 * Authentication: Required
 * Permissions: Requires "read" permission on the specific token
 * Method: GET /token/stats/{tokenAddress}/supply-changes
 *
 * @param input.tokenAddress - The token contract address to query
 * @param input.days - Number of days to look back for historical data (default: 30)
 * @returns Promise<AssetSupplyChangesMetrics> - Historical supply change data
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required read permissions on the token
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get supply changes history for the last 60 days
 * const metrics = await orpc.token.statsSupplyChanges.query({
 *   input: { tokenAddress: '0x1234...', days: 60 }
 * });
 * console.log(metrics.supplyChangesHistory);
 * ```
 */
export const statsSupplyChanges = tokenRouter.token.statsSupplyChanges.handler(
  async ({ context, input }) => {
    // Token context is guaranteed by tokenRouter middleware

    // Extract parameters with defaults applied by schema
    // tokenAddress is now validated as proper Ethereum address by schema
    const { tokenAddress, days } = input;

    // Calculate the date range for queries
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Validate timestamp is not too far in the past (blockchain inception)
    const minTimestamp = Math.floor(new Date("2015-07-30").getTime() / 1000); // Ethereum mainnet launch
    const sinceTimestamp = Math.max(
      minTimestamp,
      Math.floor(since.getTime() / 1000)
    );

    // Fetch token supply changes history from TheGraph
    // tokenAddress is already validated and checksummed by ethereumAddress schema
    const response = await context.theGraphClient.query(
      TOKEN_SUPPLY_CHANGES_QUERY,
      {
        input: {
          tokenId: tokenAddress.toLowerCase(),
          since: sinceTimestamp.toString(),
        },
        output: TokenSupplyChangesResponseSchema,
      }
    );

    return {
      supplyChangesHistory: response.tokenStats_collection,
    };
  }
);

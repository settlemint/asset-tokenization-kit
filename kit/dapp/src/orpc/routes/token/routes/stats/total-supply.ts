import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { z } from "zod";

/**
 * GraphQL query to fetch token-specific total supply history
 * Retrieves historical total supply data for a specific token
 */
const TOKEN_TOTAL_SUPPLY_QUERY = theGraphGraphql(`
  query TokenTotalSupplyHistory($tokenId: String!, $since: Timestamp!) {
    tokenStats_collection(
      where: { token: $tokenId, timestamp_gte: $since }
      interval: day
      orderBy: timestamp
      orderDirection: asc
    ) {
      timestamp
      totalSupply
    }
  }
`);

// Schema for the GraphQL response
const StatsTotalSupplyResponseSchema = z.object({
  tokenStats_collection: z.array(
    z.object({
      timestamp: z.string(),
      totalSupply: z.string(),
    })
  ),
});

/**
 * Helper function to process token stats into total supply history data
 * Converts raw token statistics into timestamped total supply data points
 *
 * @param tokenStats - Token statistics from TheGraph
 * @returns Processed total supply history data
 */
function processTotalSupplyHistoryData(
  tokenStats: {
    timestamp: string;
    totalSupply: string;
  }[]
): {
  timestamp: number;
  totalSupply: string;
}[] {
  return tokenStats.map((stat) => ({
    timestamp: Number.parseInt(stat.timestamp, 10),
    totalSupply: stat.totalSupply,
  }));
}

/**
 * Asset-specific total supply history route handler.
 *
 * Fetches comprehensive total supply history for a specific asset including:
 * - Historical total supply data points over the specified time range
 * - Optional total collateral data for stablecoin/tokenizeddeposit assets
 * - Data optimized for charting and trend analysis
 *
 * This endpoint is optimized for dashboard total supply widgets and historical charts.
 *
 * Authentication: Required
 * Permissions: Requires "read" permission on the specific token
 * Method: GET /token/stats/{tokenAddress}/total-supply
 *
 * @param input.tokenAddress - The token contract address to query
 * @param input.days - Number of days to look back for historical data (default: 30)
 * @returns Promise<AssetTotalSupplyMetrics> - Historical total supply data
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required read permissions on the token
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get total supply history for the last 60 days
 * const metrics = await orpc.token.statsAssetTotalSupply.query({
 *   input: { tokenAddress: '0x1234...', days: 60 }
 * });
 * console.log(metrics.totalSupplyHistory);
 * ```
 */
export const statsTotalSupply = tokenRouter.token.statsTotalSupply.handler(
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

    // Fetch token total supply history from TheGraph
    // tokenAddress is already validated and checksummed by ethereumAddress schema
    const response = await context.theGraphClient.query(
      TOKEN_TOTAL_SUPPLY_QUERY,
      {
        input: {
          tokenId: tokenAddress.toLowerCase(),
          since: sinceTimestamp.toString(),
        },
        output: StatsTotalSupplyResponseSchema,
      }
    );

    // Process the raw data into the expected output format
    const totalSupplyHistory = processTotalSupplyHistoryData(
      response.tokenStats_collection
    );

    return {
      totalSupplyHistory,
    };
  }
);

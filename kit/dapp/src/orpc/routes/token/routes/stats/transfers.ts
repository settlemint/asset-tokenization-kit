import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { z } from "zod";

/**
 * GraphQL query to fetch token-specific total transfers history
 * Retrieves historical total transfers data for a specific token
 */
const TOKEN_TRANSFERS_QUERY = theGraphGraphql(`
  query TokenTransfersHistory($tokenId: String!, $since: Timestamp!) {
    tokenStats_collection(
      where: { token: $tokenId, timestamp_gte: $since }
      interval: day
      orderBy: timestamp
      orderDirection: asc
    ) {
      timestamp
      totalTransferred
    }
  }
`);

// Schema for the GraphQL response
const StatsTransfersResponseSchema = z.object({
  tokenStats_collection: z.array(
    z.object({
      timestamp: z.string(),
      totalTransferred: z.string(),
    })
  ),
});

/**
 * Helper function to process token stats into total transfers history data
 * Converts raw token statistics into timestamped total transfers data points
 *
 * @param tokenStats - Token statistics from TheGraph
 * @returns Processed total transfers history data
 */
function processTransfersHistoryData(
  tokenStats: {
    timestamp: string;
    totalTransferred: string;
  }[]
): {
  timestamp: number;
  totalTransferred: string;
}[] {
  return tokenStats.map((stat) => ({
    timestamp: Number.parseInt(stat.timestamp, 10),
    totalTransferred: stat.totalTransferred,
  }));
}

/**
 * Asset-specific total transfers history route handler.
 *
 * Fetches comprehensive total transfers history for a specific asset including:
 * - Historical total transfers data points over the specified time range
 * - Cumulative transfer amounts showing activity over time
 * - Data optimized for charting and trend analysis
 *
 * This endpoint is optimized for dashboard transfer activity widgets and historical charts.
 *
 * Authentication: Required
 * Permissions: Requires "read" permission on the specific token
 * Method: GET /token/stats/{tokenAddress}/transfers
 *
 * @param input.tokenAddress - The token contract address to query
 * @param input.days - Number of days to look back for historical data (default: 30)
 * @returns Promise<AssetTransfersMetrics> - Historical total transfers data
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required read permissions on the token
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get total transfers history for the last 60 days
 * const metrics = await orpc.token.statsTransfers.query({
 *   input: { tokenAddress: '0x1234...', days: 60 }
 * });
 * console.log(metrics.transfersHistory);
 * ```
 */
export const statsTransfers = tokenRouter.token.statsTransfers
  .use(theGraphMiddleware)
  .handler(async ({ context, input }) => {
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

    // Fetch token total transfers history from TheGraph
    // tokenAddress is already validated and checksummed by ethereumAddress schema
    const response = await context.theGraphClient.query(
      TOKEN_TRANSFERS_QUERY,
      {
        input: {
          tokenId: tokenAddress.toLowerCase(),
          since: sinceTimestamp.toString(),
        },
        output: StatsTransfersResponseSchema,
      }
    );

    // Process the raw data into the expected output format
    const transfersHistory = processTransfersHistoryData(
      response.tokenStats_collection
    );

    return {
      transfersHistory,
    };
  });
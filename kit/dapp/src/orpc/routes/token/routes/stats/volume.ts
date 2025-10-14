import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { timestamp } from "@atk/zod/timestamp";
import * as z from "zod";

/**
 * GraphQL query to fetch token-specific total volume history
 * Retrieves historical total volume data for a specific token
 */
const TOKEN_VOLUME_QUERY = theGraphGraphql(`
  query TokenVolumeHistory($tokenId: String!, $since: Timestamp!) {
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
const StatsVolumeResponseSchema = z.object({
  tokenStats_collection: z.array(
    z.object({
      timestamp: timestamp(),
      totalTransferred: z.string(),
    })
  ),
});

/**
 * Asset-specific total volume history route handler.
 *
 * Fetches comprehensive total volume history for a specific asset including:
 * - Historical total volume data points over the specified time range
 * - Cumulative transaction volumes showing trading activity over time
 * - Data optimized for charting and trend analysis
 *
 * This endpoint is optimized for dashboard volume widgets and historical charts.
 *
 * Authentication: Required
 * Permissions: Requires "read" permission on the specific token
 * Method: GET /token/stats/{tokenAddress}/volume
 *
 * @param input.tokenAddress - The token contract address to query
 * @param input.days - Number of days to look back for historical data (default: 30)
 * @returns Promise<AssetVolumeMetrics> - Historical total volume data
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks required read permissions on the token
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get total volume history for the last 60 days
 * const metrics = await orpc.token.statsVolume.query({
 *   input: { tokenAddress: '0x1234...', days: 60 }
 * });
 * console.log(metrics.volumeHistory);
 * ```
 */
export const statsVolume = tokenRouter.token.statsVolume.handler(
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

    // Fetch token total volume history from TheGraph
    // tokenAddress is already validated and checksummed by ethereumAddress schema
    const response = await context.theGraphClient.query(TOKEN_VOLUME_QUERY, {
      input: {
        tokenId: tokenAddress.toLowerCase(),
        since: sinceTimestamp.toString(),
      },
      output: StatsVolumeResponseSchema,
    });

    // Process the raw data into the expected output format
    const volumeHistory = response.tokenStats_collection.map((stat) => ({
      ...stat,
      totalVolume: stat.totalTransferred,
    }));

    return {
      volumeHistory,
    };
  }
);

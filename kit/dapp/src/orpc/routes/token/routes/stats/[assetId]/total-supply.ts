import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { z } from "zod";

/**
 * GraphQL query to fetch asset-specific total supply history
 * Retrieves historical total supply and collateral data for a specific asset
 */
const ASSET_TOTAL_SUPPLY_QUERY = theGraphGraphql(`
  query AssetTotalSupplyHistory($assetId: String!, $since: Timestamp!) {
    assetStats_collection(
      where: { asset: $assetId, timestamp_gte: $since }
      orderBy: timestamp_ASC
    ) {
      timestamp
      totalSupply
      totalCollateral
      asset {
        assetType
      }
    }
  }
`);

// Schema for the GraphQL response
const AssetTotalSupplyResponseSchema = z.object({
  assetStats_collection: z.array(
    z.object({
      timestamp: z.string(),
      totalSupply: z.string(),
      totalCollateral: z.string().nullable(),
      asset: z.object({
        assetType: z.string(),
      }),
    })
  ),
});

/**
 * Helper function to process asset stats into total supply history data
 * Converts raw asset statistics into timestamped total supply data points
 *
 * @param assetStats - Raw asset statistics from TheGraph
 * @returns Processed total supply history with conditional collateral data
 */
function processTotalSupplyHistoryData(
  assetStats: {
    timestamp: string;
    totalSupply: string;
    totalCollateral: string | null;
    asset: { assetType: string };
  }[]
): {
  timestamp: number;
  totalSupply: string;
  totalCollateral?: string;
}[] {
  return assetStats.map((stat) => {
    const result: {
      timestamp: number;
      totalSupply: string;
      totalCollateral?: string;
    } = {
      timestamp: Number.parseInt(stat.timestamp, 10),
      totalSupply: stat.totalSupply,
    };

    // Include totalCollateral for stablecoin and tokenizeddeposit asset types
    if (
      stat.totalCollateral &&
      (stat.asset.assetType === "stablecoin" ||
        stat.asset.assetType === "tokenizeddeposit")
    ) {
      result.totalCollateral = stat.totalCollateral;
    }

    return result;
  });
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
 * Method: GET /token/stats/{assetId}/total-supply
 *
 * @param input.assetId - The asset contract address to query
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
 *   input: { assetId: '0x1234...', days: 60 }
 * });
 * console.log(metrics.totalSupplyHistory);
 * ```
 */
export const statsAssetTotalSupply = tokenRouter.token.statsAssetTotalSupply
  .use(theGraphMiddleware)
  .handler(async ({ context, input }) => {
    // Token context is guaranteed by tokenRouter middleware

    // Extract parameters with defaults applied by schema
    const { assetId, days } = input;

    // Calculate the date range for queries
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceTimestamp = Math.floor(since.getTime() / 1000); // Convert to Unix timestamp

    // Fetch asset total supply history from TheGraph
    const response = await context.theGraphClient.query(
      ASSET_TOTAL_SUPPLY_QUERY,
      {
        input: {
          assetId: assetId.toLowerCase(),
          since: sinceTimestamp.toString(),
        },
        output: AssetTotalSupplyResponseSchema,
        error: "Failed to fetch asset total supply history",
      }
    );

    // Process the raw data into the expected output format
    const totalSupplyHistory = processTotalSupplyHistoryData(
      response.assetStats_collection
    );

    return {
      totalSupplyHistory,
    };
  });

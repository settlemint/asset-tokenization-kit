import { theGraphGraphql } from "@/lib/graphql/the-graph";
import { tokenMiddleware } from "@/orpc/middlewares/system/token.middleware";

import { authRouter } from "@/orpc/router.auth";
import { z } from "zod";

/**
 * GraphQL query to fetch volume data for a specific token
 */
const TOKEN_VOLUME_QUERY = theGraphGraphql(`
  query TokenVolume($since: Timestamp!) {
    # Get transfer event counts aggregated by day as volume proxy
    volumeStats: eventStats_collection(
      where: {
        eventName: "Transfer"
        timestamp_gte: $since
      }
      interval: day
      orderBy: timestamp
      orderDirection: asc
    ) {
      timestamp
      eventsCount
    }
  }
`);

// Schema for volume GraphQL response
const VolumeResponseSchema = z.object({
  volumeStats: z.array(
    z.object({
      timestamp: z.string(),
      eventsCount: z.number(),
    })
  ),
});

/**
 * Asset-specific volume route handler.
 * GET /stats/{address}/volume
 */
export const assetVolume = authRouter.token.statsAssetVolume
  .use(tokenMiddleware)
  .handler(async ({ context, input }) => {
    const tokenId = context.token.id.toLowerCase();
    const timeRange = input.timeRange;

    console.log("📊 Volume handler debug:", {
      originalTokenId: context.token.id,
      lowercaseTokenId: tokenId,
      inputAddress: input.address,
      tokenIdType: typeof tokenId,
      tokenIdLength: tokenId?.length,
    });

    // Calculate the date range for queries
    const since = new Date();
    since.setDate(since.getDate() - timeRange);
    const sinceTimestamp = Math.floor(since.getTime() / 1000);

    console.log("📊 About to query subgraph with:", {
      tokenId,
      since: sinceTimestamp.toString(),
    });

    // Fetch volume data using event stats
    const response = await context.theGraphClient.query(TOKEN_VOLUME_QUERY, {
      input: {
        since: sinceTimestamp.toString(),
      },
      output: VolumeResponseSchema,
      error: "Failed to fetch token volume data",
    });

    // Convert event counts to volume data (using counts as proxy)
    const volumeHistory = response.volumeStats.map((stat) => ({
      timestamp: stat.timestamp,
      volume: stat.eventsCount, // Using event count as volume proxy
      transactions: stat.eventsCount,
    }));

    const totalVolume = volumeHistory.reduce(
      (sum: number, day) => sum + day.volume,
      0
    );

    return {
      tokenId,
      timeRangeDays: timeRange,
      volumeHistory,
      totalVolume: totalVolume.toString(),
    };
  });

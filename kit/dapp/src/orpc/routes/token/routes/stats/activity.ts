import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { assetType } from "@/lib/zod/validators/asset-types";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { z } from "zod";

/**
 * GraphQL query to fetch system-wide activity data by asset type
 */
const SYSTEM_ACTIVITY_QUERY = theGraphGraphql(`
  query SystemActivity {
    # Token statistics for asset type mapping
    tokenStatsStates {
      token {
        type
        symbol
        name
      }
    }

    # Event counts for different asset activities
    mintEvents: eventStats_collection(
      where: { eventName: "Mint" }
      interval: day
    ) {
      eventsCount
    }

    burnEvents: eventStats_collection(
      where: { eventName: "Burn" }
      interval: day
    ) {
      eventsCount
    }

    transferEvents: eventStats_collection(
      where: { eventName: "Transfer" }
      interval: day
    ) {
      eventsCount
    }

    clawbackEvents: eventStats_collection(
      where: { eventName: "Clawback" }
      interval: day
    ) {
      eventsCount
    }
  }
`);

/**
 * GraphQL query to fetch activity data for a specific token
 */
const ASSET_ACTIVITY_QUERY = theGraphGraphql(`
  query AssetActivity($tokenId: ID!, $since: Timestamp!) {
    token(id: $tokenId) {
      id
      # Get activity stats aggregated by day
      activityStats: eventStats_collection(
        where: {
          token: $tokenId
          timestamp_gte: $since
        }
        interval: day
        orderBy: timestamp
        orderDirection: asc
      ) {
        timestamp
        eventName
        eventsCount
      }
    }
  }
`);

// Schema for system activity GraphQL response
const SystemActivityResponseSchema = z.object({
  tokenStatsStates: z.array(
    z.object({
      token: z.object({
        type: assetType(),
        symbol: z.string(),
        name: z.string(),
      }),
    })
  ),
  mintEvents: z.array(z.object({ eventsCount: z.number() })),
  burnEvents: z.array(z.object({ eventsCount: z.number() })),
  transferEvents: z.array(z.object({ eventsCount: z.number() })),
  clawbackEvents: z.array(z.object({ eventsCount: z.number() })),
});

// Schema for asset activity GraphQL response
const AssetActivityResponseSchema = z.object({
  token: z
    .object({
      id: z.string(),
      activityStats: z.array(
        z.object({
          timestamp: z.string(),
          eventName: z.string(),
          eventsCount: z.number(),
        })
      ),
    })
    .nullable(),
});

/**
 * Helper function to sum event counts from event stats
 */
function sumEventCounts(eventStats: { eventsCount: number }[]): number {
  return eventStats.reduce((total, stat) => total + stat.eventsCount, 0);
}

/**
 * Helper function to create asset activity data from token stats and event stats
 */
function createSystemActivity(
  tokenStats: { token: { type: string } }[],
  eventStats: {
    mintEvents: { eventsCount: number }[];
    burnEvents: { eventsCount: number }[];
    transferEvents: { eventsCount: number }[];
    clawbackEvents: { eventsCount: number }[];
  }
) {
  // Count tokens by asset type
  const assetTypeCounts = new Map<string, number>();
  for (const tokenStat of tokenStats) {
    const assetType = tokenStat.token.type;
    assetTypeCounts.set(assetType, (assetTypeCounts.get(assetType) ?? 0) + 1);
  }

  // Calculate total event counts
  const totalMint = sumEventCounts(eventStats.mintEvents);
  const totalBurn = sumEventCounts(eventStats.burnEvents);
  const totalTransfer = sumEventCounts(eventStats.transferEvents);
  const totalClawback = sumEventCounts(eventStats.clawbackEvents);

  const totalTokens = tokenStats.length;

  // Distribute events proportionally across asset types
  return [...assetTypeCounts.entries()]
    .filter(([, count]) => count > 0)
    .map(([assetType, tokenCount]) => {
      const eventShare = totalTokens > 0 ? tokenCount / totalTokens : 0;

      return {
        assetType,
        mint: Math.floor(totalMint * eventShare),
        transfer: Math.floor(totalTransfer * eventShare),
        burn: Math.floor(totalBurn * eventShare),
        clawback: Math.floor(totalClawback * eventShare),
      };
    });
}

/**
 * System-wide activity route handler.
 * GET /stats/activity
 */
export const activity = authRouter.token.statsActivity
  .use(systemMiddleware)
  .use(theGraphMiddleware)
  .handler(async ({ context }) => {
    const response = await context.theGraphClient.query(SYSTEM_ACTIVITY_QUERY, {
      input: {},
      output: SystemActivityResponseSchema,
      error: "Failed to fetch system activity",
    });

    const assetActivity = createSystemActivity(response.tokenStatsStates, {
      mintEvents: response.mintEvents,
      burnEvents: response.burnEvents,
      transferEvents: response.transferEvents,
      clawbackEvents: response.clawbackEvents,
    });

    return { assetActivity };
  });

/**
 * Asset-specific activity route handler.
 * GET /stats/{address}/activity
 */
export const assetActivity = tokenRouter.token.statsAssetActivity
  .use(theGraphMiddleware)
  .handler(async ({ context, input }) => {
    const tokenId = context.token.id.toLowerCase();
    const timeRange = input.timeRange ?? 30;

    // Calculate the date range for queries
    const since = new Date();
    since.setDate(since.getDate() - timeRange);
    const sinceTimestamp = Math.floor(since.getTime() / 1000);

    // Fetch token-specific activity
    const response = await context.theGraphClient.query(ASSET_ACTIVITY_QUERY, {
      input: {
        tokenId,
        since: sinceTimestamp.toString(),
      },
      output: AssetActivityResponseSchema,
      error: "Failed to fetch asset activity",
    });

    if (!response.token) {
      return {
        tokenId,
        timeRangeDays: timeRange,
        activityHistory: [],
      };
    }

    // Group activity by timestamp and event type
    const activityByDate = new Map<
      string,
      {
        timestamp: string;
        mints: number;
        burns: number;
        transfers: number;
      }
    >();

    for (const stat of response.token.activityStats) {
      const dateKey = stat.timestamp;

      if (!activityByDate.has(dateKey)) {
        activityByDate.set(dateKey, {
          timestamp: stat.timestamp,
          mints: 0,
          burns: 0,
          transfers: 0,
        });
      }

      const dayData = activityByDate.get(dateKey) ?? {
        timestamp: stat.timestamp,
        mints: 0,
        burns: 0,
        transfers: 0,
      };

      switch (stat.eventName) {
        case "Mint":
          dayData.mints += stat.eventsCount;
          break;
        case "Burn":
          dayData.burns += stat.eventsCount;
          break;
        case "Transfer":
          dayData.transfers += stat.eventsCount;
          break;
      }
    }

    // Convert to array and sort by timestamp
    const activityHistory = [...activityByDate.values()].sort((a, b) =>
      a.timestamp.localeCompare(b.timestamp)
    );

    return {
      tokenId,
      timeRangeDays: timeRange,
      activityHistory,
    };
  });

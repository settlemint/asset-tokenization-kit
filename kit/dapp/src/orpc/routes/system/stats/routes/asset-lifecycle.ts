import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { createTimeSeries } from "@/lib/utils/timeseries";
import { systemRouter } from "@/orpc/procedures/system.router";
import { buildStatsRangeQuery } from "@atk/zod/stats-range";
import { timestamp } from "@atk/zod/timestamp";
import { z } from "zod";

const SYSTEM_STATS_QUERY = theGraphGraphql(`
  query SystemAssetLifecycle(
    $systemIdString: String!
    $systemId: ID!
    $interval: Aggregation_interval!
    $from: Timestamp!
    $to: Timestamp!
  ) {
    systemStats: systemStats_collection(
      interval: $interval
      where: {
        system: $systemIdString
        timestamp_gte: $from
        timestamp_lte: $to
      }
      orderBy: timestamp
      orderDirection: asc
    ) {
      timestamp
      tokensCreatedCount
      tokensLaunchedCount
    }
    current: systemStatsState(id: $systemId) {
      tokensCreatedCount
      tokensLaunchedCount
    }
  }
`);

const SystemStatsDataItem = z.object({
  timestamp: timestamp(),
  tokensCreatedCount: z.number(),
  tokensLaunchedCount: z.number(),
});

const SystemStatsResponseSchema = z.object({
  systemStats: z.array(SystemStatsDataItem),
  current: z
    .object({
      tokensCreatedCount: z.number(),
      tokensLaunchedCount: z.number(),
    })
    .nullable(),
});

export const statsAssetLifecycle =
  systemRouter.system.stats.assetLifecycle.handler(
    async ({ context, input }) => {
      const now = new Date();
      const { interval, fromMicroseconds, toMicroseconds, range } =
        buildStatsRangeQuery(input, {
          now,
          // TODO: replace minFrom with context.system.createdAt when available
        });

      const systemId = context.system.id.toLowerCase();
      const response = await context.theGraphClient.query(SYSTEM_STATS_QUERY, {
        input: {
          systemId,
          systemIdString: systemId,
          interval,
          from: fromMicroseconds,
          to: toMicroseconds,
        },
        output: SystemStatsResponseSchema,
      });

      const results = [
        ...response.systemStats.map((item) => ({
          timestamp: item.timestamp,
          assetsCreated: item.tokensCreatedCount,
          assetsLaunched: item.tokensLaunchedCount,
        })),
        {
          timestamp: range.to,
          assetsCreated: response.current?.tokensCreatedCount ?? 0,
          assetsLaunched: response.current?.tokensLaunchedCount ?? 0,
        },
      ];

      const data = createTimeSeries(
        results,
        ["assetsCreated", "assetsLaunched"],
        {
          range,
          aggregation: "last",
          accumulation: "max",
          historical: true,
        }
      );

      return {
        range,
        data,
      };
    }
  );

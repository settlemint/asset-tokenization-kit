import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { systemRouter } from "@/orpc/procedures/system.router";
import { buildStatsRangeQuery } from "@atk/zod/stats-range";
import { timestamp } from "@atk/zod/timestamp";
import { subHours } from "date-fns";
import { z } from "zod";

const SYSTEM_STATS_QUERY = theGraphGraphql(`
  query SystemAssetLifecycle(
    $systemId: String!
    $interval: Aggregation_interval!
    $from: Timestamp!
    $to: Timestamp!
  ) {
    systemStats: systemStats_collection(
      interval: $interval
      where: {
        system: $systemId
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
  }
`);

const SystemStatsDataItem = z.object({
  timestamp: timestamp(),
  tokensCreatedCount: z.number(),
  tokensLaunchedCount: z.number(),
});

const SystemStatsResponseSchema = z.object({
  systemStats: z.array(SystemStatsDataItem),
});

export const statsAssetLifecycle =
  systemRouter.system.stats.assetLifecycle.handler(
    async ({ context, input }) => {
      const now = new Date();
      const { interval, fromMicroseconds, toMicroseconds, range } =
        buildStatsRangeQuery(input, {
          now,
          minFrom: subHours(now, 48),
          // TODO: replace minFrom with context.system.createdAt when available
        });

      const response = await context.theGraphClient.query(SYSTEM_STATS_QUERY, {
        input: {
          systemId: context.system.id.toLowerCase(),
          interval,
          from: fromMicroseconds,
          to: toMicroseconds,
        },
        output: SystemStatsResponseSchema,
      });

      return {
        range,
        data: response.systemStats.map((item) => ({
          timestamp: item.timestamp,
          assetsCreatedCount: item.tokensCreatedCount,
          assetsLaunchedCount: item.tokensLaunchedCount,
        })),
      };
    }
  );

import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { createTimeSeries } from "@/lib/utils/timeseries";
import { systemRouter } from "@/orpc/procedures/system.router";
import { buildStatsRangeQuery } from "@atk/zod/stats-range";
import { timestamp } from "@atk/zod/timestamp";
import { z } from "zod";

const SYSTEM_ASSET_ACTIVITY_QUERY = theGraphGraphql(`
  query SystemAssetActivity(
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
      transferEventsCount
      mintEventsCount
      burnEventsCount
    }
    baseline: systemStats_collection(
      interval: $interval
      where: {
        system: $systemIdString
        timestamp_lte: $from
      }
      orderBy: timestamp
      orderDirection: desc
      first: 1
    ) {
      timestamp
      transferEventsCount
      mintEventsCount
      burnEventsCount
    }
    current: systemStatsState(id: $systemId) {
      transferEventsCount
      mintEventsCount
      burnEventsCount
    }
  }
`);

const SystemAssetActivityDataItem = z.object({
  timestamp: timestamp(),
  transferEventsCount: z.number(),
  mintEventsCount: z.number(),
  burnEventsCount: z.number(),
});

const SystemAssetActivityResponseSchema = z.object({
  systemStats: z.array(SystemAssetActivityDataItem),
  baseline: z.array(SystemAssetActivityDataItem),
  current: z
    .object({
      transferEventsCount: z.number(),
      mintEventsCount: z.number(),
      burnEventsCount: z.number(),
    })
    .nullable(),
});

export const statsAssetActivity =
  systemRouter.system.stats.assetActivity.handler(
    async ({ context, input }) => {
      const now = new Date();
      const { interval, fromMicroseconds, toMicroseconds, range } =
        buildStatsRangeQuery(input, {
          now,
          // TODO: replace minFrom with context.system.createdAt when available
        });

      const systemId = context.system.id.toLowerCase();
      const response = await context.theGraphClient.query(
        SYSTEM_ASSET_ACTIVITY_QUERY,
        {
          input: {
            systemId,
            systemIdString: systemId,
            interval,
            from: fromMicroseconds,
            to: toMicroseconds,
          },
          output: SystemAssetActivityResponseSchema,
        }
      );

      const results = [
        ...response.baseline.map((item) => ({
          timestamp: item.timestamp,
          transferEventsCount: item.transferEventsCount,
          mintEventsCount: item.mintEventsCount,
          burnEventsCount: item.burnEventsCount,
        })),
        ...response.systemStats.map((item) => ({
          timestamp: item.timestamp,
          transferEventsCount: item.transferEventsCount,
          mintEventsCount: item.mintEventsCount,
          burnEventsCount: item.burnEventsCount,
        })),
        {
          timestamp: range.to,
          transferEventsCount: response.current?.transferEventsCount ?? 0,
          mintEventsCount: response.current?.mintEventsCount ?? 0,
          burnEventsCount: response.current?.burnEventsCount ?? 0,
        },
      ];

      const data = createTimeSeries(
        results,
        ["transferEventsCount", "mintEventsCount", "burnEventsCount"],
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

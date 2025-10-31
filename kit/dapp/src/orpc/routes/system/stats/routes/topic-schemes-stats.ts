import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { createTimeSeries } from "@/lib/utils/timeseries";
import { systemRouter } from "@/orpc/procedures/system.router";
import { buildStatsRangeQuery } from "@atk/zod/stats-range";
import { timestamp } from "@atk/zod/timestamp";
import { z } from "zod";

const TOPIC_SCHEMES_STATS_QUERY = theGraphGraphql(`
  query TopicSchemesStats(
    $topicSchemeRegistryIdString: String!
    $topicSchemeRegistryId: ID!
    $interval: Aggregation_interval!
    $from: Timestamp!
    $to: Timestamp!
  ) {
    topicSchemesStats: topicSchemesStats_collection(
      interval: $interval
      where: {
        topicSchemeRegistry: $topicSchemeRegistryIdString
        timestamp_gte: $from
        timestamp_lte: $to
      }
      orderBy: timestamp
      orderDirection: asc
    ) {
      timestamp
      totalRegisteredTopicSchemes
      totalActiveTopicSchemes
      totalRemovedTopicSchemes
    }
    baseline: topicSchemesStats_collection(
      interval: $interval
      where: {
        topicSchemeRegistry: $topicSchemeRegistryIdString
        timestamp_lte: $from
      }
      orderBy: timestamp
      orderDirection: desc
      first: 1
    ) {
      timestamp
      totalRegisteredTopicSchemes
      totalActiveTopicSchemes
      totalRemovedTopicSchemes
    }
    current: topicSchemesState(id: $topicSchemeRegistryId) {
      totalRegisteredTopicSchemes
      totalActiveTopicSchemes
      totalRemovedTopicSchemes
    }
  }
`);

const TopicSchemesStatsDataItem = z.object({
  timestamp: timestamp(),
  totalRegisteredTopicSchemes: z.coerce.number(),
  totalActiveTopicSchemes: z.coerce.number(),
  totalRemovedTopicSchemes: z.coerce.number(),
});

const TopicSchemesStatsResponseSchema = z.object({
  topicSchemesStats: z.array(TopicSchemesStatsDataItem),
  baseline: z.array(TopicSchemesStatsDataItem),
  current: z
    .object({
      totalRegisteredTopicSchemes: z.coerce.number(),
      totalActiveTopicSchemes: z.coerce.number(),
      totalRemovedTopicSchemes: z.coerce.number(),
    })
    .nullable(),
});

export const statsTopicSchemesStatsByRange =
  systemRouter.system.stats.topicSchemesStatsByRange.handler(
    async ({ context, input }) => {
      const now = new Date();
      const { interval, fromMicroseconds, toMicroseconds, range } =
        buildStatsRangeQuery(input, {
          now,
        });

      const topicSchemeRegistryId =
        context.system.topicSchemeRegistry.id.toLowerCase();

      const response = await context.theGraphClient.query(
        TOPIC_SCHEMES_STATS_QUERY,
        {
          input: {
            topicSchemeRegistryId,
            topicSchemeRegistryIdString: topicSchemeRegistryId,
            interval,
            from: fromMicroseconds,
            to: toMicroseconds,
          },
          output: TopicSchemesStatsResponseSchema,
        }
      );

      const results = [
        ...response.baseline.map((item) => ({
          timestamp: item.timestamp,
          totalRegisteredTopicSchemes: item.totalRegisteredTopicSchemes,
          totalActiveTopicSchemes: item.totalActiveTopicSchemes,
          totalRemovedTopicSchemes: item.totalRemovedTopicSchemes,
        })),
        ...response.topicSchemesStats.map((item) => ({
          timestamp: item.timestamp,
          totalRegisteredTopicSchemes: item.totalRegisteredTopicSchemes,
          totalActiveTopicSchemes: item.totalActiveTopicSchemes,
          totalRemovedTopicSchemes: item.totalRemovedTopicSchemes,
        })),
        {
          timestamp: range.to,
          totalRegisteredTopicSchemes:
            response.current?.totalRegisteredTopicSchemes ?? 0,
          totalActiveTopicSchemes:
            response.current?.totalActiveTopicSchemes ?? 0,
          totalRemovedTopicSchemes:
            response.current?.totalRemovedTopicSchemes ?? 0,
        },
      ];

      const data = createTimeSeries(
        results,
        [
          "totalRegisteredTopicSchemes",
          "totalActiveTopicSchemes",
          "totalRemovedTopicSchemes",
        ],
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

export const statsTopicSchemesStatsByPreset =
  systemRouter.system.stats.topicSchemesStatsByPreset.handler(
    async ({ context, input }) => {
      const now = new Date();
      const { interval, fromMicroseconds, toMicroseconds, range } =
        buildStatsRangeQuery(input.preset, {
          now,
        });

      const topicSchemeRegistryId =
        context.system.topicSchemeRegistry.id.toLowerCase();

      const response = await context.theGraphClient.query(
        TOPIC_SCHEMES_STATS_QUERY,
        {
          input: {
            topicSchemeRegistryId,
            topicSchemeRegistryIdString: topicSchemeRegistryId,
            interval,
            from: fromMicroseconds,
            to: toMicroseconds,
          },
          output: TopicSchemesStatsResponseSchema,
        }
      );

      const results = [
        ...response.baseline.map((item) => ({
          timestamp: item.timestamp,
          totalRegisteredTopicSchemes: item.totalRegisteredTopicSchemes,
          totalActiveTopicSchemes: item.totalActiveTopicSchemes,
          totalRemovedTopicSchemes: item.totalRemovedTopicSchemes,
        })),
        ...response.topicSchemesStats.map((item) => ({
          timestamp: item.timestamp,
          totalRegisteredTopicSchemes: item.totalRegisteredTopicSchemes,
          totalActiveTopicSchemes: item.totalActiveTopicSchemes,
          totalRemovedTopicSchemes: item.totalRemovedTopicSchemes,
        })),
        {
          timestamp: range.to,
          totalRegisteredTopicSchemes:
            response.current?.totalRegisteredTopicSchemes ?? 0,
          totalActiveTopicSchemes:
            response.current?.totalActiveTopicSchemes ?? 0,
          totalRemovedTopicSchemes:
            response.current?.totalRemovedTopicSchemes ?? 0,
        },
      ];

      const data = createTimeSeries(
        results,
        [
          "totalRegisteredTopicSchemes",
          "totalActiveTopicSchemes",
          "totalRemovedTopicSchemes",
        ],
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

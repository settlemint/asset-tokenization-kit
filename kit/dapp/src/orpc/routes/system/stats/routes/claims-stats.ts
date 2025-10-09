import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { createTimeSeries } from "@/lib/utils/timeseries";
import { systemRouter } from "@/orpc/procedures/system.router";
import { buildStatsRangeQuery } from "@atk/zod/stats-range";
import { timestamp } from "@atk/zod/timestamp";
import { z } from "zod";

const CLAIMS_STATS_QUERY = theGraphGraphql(`
  query ClaimsStats(
    $topicSchemeRegistryIdString: String!
    $topicSchemeRegistryId: ID!
    $interval: Aggregation_interval!
    $from: Timestamp!
    $to: Timestamp!
  ) {
    claimsStats: claimsStats_collection(
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
      totalIssuedClaims
      totalActiveClaims
      totalRemovedClaims
      totalRevokedClaims
    }
    baseline: claimsStats_collection(
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
      totalIssuedClaims
      totalActiveClaims
      totalRemovedClaims
      totalRevokedClaims
    }
    current: claimsStatsState(id: $topicSchemeRegistryId) {
      totalIssuedClaims
      totalActiveClaims
      totalRemovedClaims
      totalRevokedClaims
    }
  }
`);

const ClaimsStatsDataItem = z.object({
  timestamp: timestamp(),
  totalIssuedClaims: z.number(),
  totalActiveClaims: z.number(),
  totalRemovedClaims: z.number(),
  totalRevokedClaims: z.number(),
});

const ClaimsStatsResponseSchema = z.object({
  claimsStats: z.array(ClaimsStatsDataItem),
  baseline: z.array(ClaimsStatsDataItem),
  current: z
    .object({
      totalIssuedClaims: z.number(),
      totalActiveClaims: z.number(),
      totalRemovedClaims: z.number(),
      totalRevokedClaims: z.number(),
    })
    .nullable(),
});

export const statsClaimsStats = systemRouter.system.stats.claimsStats.handler(
  async ({ context, input }) => {
    const now = new Date();
    const { interval, fromMicroseconds, toMicroseconds, range } =
      buildStatsRangeQuery(input, {
        now,
      });

    const topicSchemeRegistryId =
      context.system.topicSchemeRegistry.id.toLowerCase();

    const response = await context.theGraphClient.query(CLAIMS_STATS_QUERY, {
      input: {
        topicSchemeRegistryId,
        topicSchemeRegistryIdString: topicSchemeRegistryId,
        interval,
        from: fromMicroseconds,
        to: toMicroseconds,
      },
      output: ClaimsStatsResponseSchema,
    });

    const results = [
      ...response.baseline.map((item) => ({
        timestamp: item.timestamp,
        totalIssuedClaims: item.totalIssuedClaims,
        totalActiveClaims: item.totalActiveClaims,
        totalRemovedClaims: item.totalRemovedClaims,
        totalRevokedClaims: item.totalRevokedClaims,
      })),
      ...response.claimsStats.map((item) => ({
        timestamp: item.timestamp,
        totalIssuedClaims: item.totalIssuedClaims,
        totalActiveClaims: item.totalActiveClaims,
        totalRemovedClaims: item.totalRemovedClaims,
        totalRevokedClaims: item.totalRevokedClaims,
      })),
      {
        timestamp: range.to,
        totalIssuedClaims: response.current?.totalIssuedClaims ?? 0,
        totalActiveClaims: response.current?.totalActiveClaims ?? 0,
        totalRemovedClaims: response.current?.totalRemovedClaims ?? 0,
        totalRevokedClaims: response.current?.totalRevokedClaims ?? 0,
      },
    ];

    const data = createTimeSeries(
      results,
      [
        "totalIssuedClaims",
        "totalActiveClaims",
        "totalRemovedClaims",
        "totalRevokedClaims",
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

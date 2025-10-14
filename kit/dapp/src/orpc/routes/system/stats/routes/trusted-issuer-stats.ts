import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { createTimeSeries } from "@/lib/utils/timeseries";
import { systemRouter } from "@/orpc/procedures/system.router";
import { buildStatsRangeQuery } from "@atk/zod/stats-range";
import { timestamp } from "@atk/zod/timestamp";
import * as z from "zod";

const TRUSTED_ISSUER_STATS_QUERY = theGraphGraphql(`
  query TrustedIssuerStats(
    $trustedIssuersRegistryIdString: String!
    $trustedIssuersRegistryId: ID!
    $interval: Aggregation_interval!
    $from: Timestamp!
    $to: Timestamp!
  ) {
    trustedIssuerStats: trustedIssuerStats_collection(
      interval: $interval
      where: {
        trustedIssuersRegistry: $trustedIssuersRegistryIdString
        timestamp_gte: $from
        timestamp_lte: $to
      }
      orderBy: timestamp
      orderDirection: asc
    ) {
      timestamp
      totalAddedTrustedIssuers
      totalActiveTrustedIssuers
      totalRemovedTrustedIssuers
    }
    baseline: trustedIssuerStats_collection(
      interval: $interval
      where: {
        trustedIssuersRegistry: $trustedIssuersRegistryIdString
        timestamp_lte: $from
      }
      orderBy: timestamp
      orderDirection: desc
      first: 1
    ) {
      timestamp
      totalAddedTrustedIssuers
      totalActiveTrustedIssuers
      totalRemovedTrustedIssuers
    }
    current: trustedIssuerStatsState(id: $trustedIssuersRegistryId) {
      totalAddedTrustedIssuers
      totalActiveTrustedIssuers
      totalRemovedTrustedIssuers
    }
  }
`);

const TrustedIssuerStatsDataItem = z.object({
  timestamp: timestamp(),
  totalAddedTrustedIssuers: z.coerce.number(),
  totalActiveTrustedIssuers: z.coerce.number(),
  totalRemovedTrustedIssuers: z.coerce.number(),
});

const TrustedIssuerStatsResponseSchema = z.object({
  trustedIssuerStats: z.array(TrustedIssuerStatsDataItem),
  baseline: z.array(TrustedIssuerStatsDataItem),
  current: z
    .object({
      totalAddedTrustedIssuers: z.coerce.number(),
      totalActiveTrustedIssuers: z.coerce.number(),
      totalRemovedTrustedIssuers: z.coerce.number(),
    })
    .nullable(),
});

export const statsTrustedIssuerStats =
  systemRouter.system.stats.trustedIssuerStats.handler(
    async ({ context, input }) => {
      const now = new Date();
      const { interval, fromMicroseconds, toMicroseconds, range } =
        buildStatsRangeQuery(input, {
          now,
        });

      const trustedIssuersRegistryId =
        context.system.trustedIssuersRegistry.id.toLowerCase();

      const response = await context.theGraphClient.query(
        TRUSTED_ISSUER_STATS_QUERY,
        {
          input: {
            trustedIssuersRegistryId,
            trustedIssuersRegistryIdString: trustedIssuersRegistryId,
            interval,
            from: fromMicroseconds,
            to: toMicroseconds,
          },
          output: TrustedIssuerStatsResponseSchema,
        }
      );

      const results = [
        ...response.baseline.map((item) => ({
          timestamp: item.timestamp,
          totalAddedTrustedIssuers: item.totalAddedTrustedIssuers,
          totalActiveTrustedIssuers: item.totalActiveTrustedIssuers,
          totalRemovedTrustedIssuers: item.totalRemovedTrustedIssuers,
        })),
        ...response.trustedIssuerStats.map((item) => ({
          timestamp: item.timestamp,
          totalAddedTrustedIssuers: item.totalAddedTrustedIssuers,
          totalActiveTrustedIssuers: item.totalActiveTrustedIssuers,
          totalRemovedTrustedIssuers: item.totalRemovedTrustedIssuers,
        })),
        {
          timestamp: range.to,
          totalAddedTrustedIssuers:
            response.current?.totalAddedTrustedIssuers ?? 0,
          totalActiveTrustedIssuers:
            response.current?.totalActiveTrustedIssuers ?? 0,
          totalRemovedTrustedIssuers:
            response.current?.totalRemovedTrustedIssuers ?? 0,
        },
      ];

      const data = createTimeSeries(
        results,
        [
          "totalAddedTrustedIssuers",
          "totalActiveTrustedIssuers",
          "totalRemovedTrustedIssuers",
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

import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { systemRouter } from "@/orpc/procedures/system.router";
import { buildStatsRangeQuery } from "@atk/zod/stats-range";
import { subHours } from "date-fns";
import { z } from "zod";

/**
 * GraphQL query to fetch identity statistics over time for charts
 * Optimized for the Identity Growth Chart specifically
 */
const IDENTITY_STATS_OVER_TIME_QUERY = theGraphGraphql(`
  query IdentityStatsOverTime($systemId: String!, $from: Timestamp!, $to: Timestamp!, $interval: Aggregation_interval!) {
    # Identity statistics over time - get aggregated daily stats from specified date
    identityStats: identityStats_collection(
      where: {
        timestamp_gte: $from
        timestamp_lte: $to
        system: $systemId
      }
      interval: $interval
      orderBy: timestamp
      orderDirection: asc
    ) {
      timestamp
      activeUserIdentitiesCount
    }
  }
`);

// Schema for the GraphQL response
const IdentityStatsOverTimeResponseSchema = z.object({
  identityStats: z.array(
    z.object({
      timestamp: z.string(),
      activeUserIdentitiesCount: z.number(),
    })
  ),
});

export const statsIdentityStatsOverTime =
  systemRouter.system.stats.identityStatsOverTime.handler(
    async ({ context, input }) => {
      const now = new Date();
      const { interval, fromMicroseconds, toMicroseconds, range } =
        buildStatsRangeQuery(input, {
          now,
          minFrom: subHours(now, 48),
          // TODO: replace minFrom with context.system.createdAt when available
        });

      // Fetch identity stats data
      const response = await context.theGraphClient.query(
        IDENTITY_STATS_OVER_TIME_QUERY,
        {
          input: {
            systemId: context.system.id.toLowerCase(),
            interval,
            from: fromMicroseconds,
            to: toMicroseconds,
          },
          output: IdentityStatsOverTimeResponseSchema,
        }
      );

      return {
        range,
        identityStats: response.identityStats,
      };
    }
  );

import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { systemRouter } from "@/orpc/procedures/system.router";
import { buildStatsRangeQuery } from "@atk/zod/stats-range";
import { timestamp } from "@atk/zod/timestamp";
import { z } from "zod";

/**
 * GraphQL query to fetch identity statistics over time for charts
 * Optimized for the Identity Growth Chart specifically
 */
const IDENTITY_STATS_OVER_TIME_QUERY = theGraphGraphql(`
  query IdentityStatsOverTime(
    $systemIdString: String!
    $systemId: ID!
    $from: Timestamp!
    $to: Timestamp!
    $interval: Aggregation_interval!
  ) {
    # Identity statistics over time - get aggregated daily stats from specified date
    identityStats: identityStats_collection(
      where: {
        timestamp_gte: $from
        timestamp_lte: $to
        system: $systemIdString
      }
      interval: $interval
      orderBy: timestamp
      orderDirection: asc
    ) {
      timestamp
      activeUserIdentitiesCount
    }
    current: identityStatsState(id: $systemId) {
      activeUserIdentitiesCount
    }
  }
`);

// Schema for the GraphQL response
const IdentityStatsOverTimeResponseSchema = z.object({
  identityStats: z.array(
    z.object({
      timestamp: timestamp(),
      activeUserIdentitiesCount: z.number(),
    })
  ),
  current: z
    .object({
      activeUserIdentitiesCount: z.number(),
    })
    .nullable(),
});

export const statsIdentityStatsOverTime =
  systemRouter.system.stats.identityStatsOverTime.handler(
    async ({ context, input }) => {
      const now = new Date();
      const { interval, fromMicroseconds, toMicroseconds, range } =
        buildStatsRangeQuery(input, {
          now,
          // TODO: replace minFrom with context.system.createdAt when available
        });

      const systemId = context.system.id.toLowerCase();
      const response = await context.theGraphClient.query(
        IDENTITY_STATS_OVER_TIME_QUERY,
        {
          input: {
            systemId,
            systemIdString: systemId,
            interval,
            from: fromMicroseconds,
            to: toMicroseconds,
          },
          output: IdentityStatsOverTimeResponseSchema,
        }
      );

      return {
        range,
        identityStats: [
          ...response.identityStats,
          {
            timestamp: range.to,
            activeUserIdentitiesCount:
              response.current?.activeUserIdentitiesCount ?? 0,
          },
        ],
      };
    }
  );

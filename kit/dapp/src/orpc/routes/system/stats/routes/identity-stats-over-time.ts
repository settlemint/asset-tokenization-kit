import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { systemRouter } from "@/orpc/procedures/system.router";
import { getUnixTime } from "date-fns";
import { z } from "zod";

/**
 * GraphQL query to fetch identity statistics over time for charts
 * Optimized for the Identity Growth Chart specifically
 */
const IDENTITY_STATS_OVER_TIME_QUERY = theGraphGraphql(`
  query IdentityStatsOverTime($systemId: String!, $from: Timestamp!, $to: Timestamp!) {
    # Identity statistics over time - get aggregated daily stats from specified date
    identityStats: identityStats_collection(
      where: {
        timestamp_gte: $from
        timestamp_lte: $to
        system: $systemId
      }
      interval: day
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
      const fromTimestamp = getUnixTime(input.fromTimestamp);
      const toTimestamp = input.toTimestamp
        ? getUnixTime(input.toTimestamp)
        : getUnixTime(new Date());

      // Fetch identity stats data
      const response = await context.theGraphClient.query(
        IDENTITY_STATS_OVER_TIME_QUERY,
        {
          input: {
            systemId: context.system.id.toLowerCase(),
            from: fromTimestamp.toString(),
            to: toTimestamp.toString(),
          },
          output: IdentityStatsOverTimeResponseSchema,
        }
      );

      return {
        identityStats: response.identityStats,
      };
    }
  );

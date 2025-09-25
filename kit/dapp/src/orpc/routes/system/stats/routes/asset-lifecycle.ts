import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { systemRouter } from "@/orpc/procedures/system.router";
import { getUnixTime } from "date-fns";
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
  timestamp: z.string(),
  tokensCreatedCount: z.number(),
  tokensLaunchedCount: z.number(),
});

const SystemStatsResponseSchema = z.object({
  systemStats: z.array(SystemStatsDataItem),
});

export const statsAssetLifecycle =
  systemRouter.system.stats.assetLifecycle.handler(
    async ({ context, input }) => {
      const toDate = getUnixTime(input.to).toString();
      const fromDate = getUnixTime(input.from).toString();

      const variables: {
        systemId: string;
        interval: "hour" | "day";
        from: string;
        to: string;
      } = {
        systemId: context.system.id.toLowerCase(),
        interval: input.interval,
        from: fromDate,
        to: toDate,
      };

      const response = await context.theGraphClient.query(SYSTEM_STATS_QUERY, {
        input: variables,
        output: SystemStatsResponseSchema,
      });

      return {
        data: response.systemStats.map((item) => ({
          timestamp: item.timestamp,
          assetsCreatedCount: item.tokensCreatedCount,
          assetsLaunchedCount: item.tokensLaunchedCount,
        })),
      };
    }
  );

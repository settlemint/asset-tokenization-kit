import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { systemRouter } from "@/orpc/procedures/system.router";
import { z } from "zod";

const TOPIC_SCHEMES_STATS_STATE_QUERY = theGraphGraphql(`
  query TopicSchemesStatsState($topicSchemeRegistryId: ID!) {
    topicSchemesState(id: $topicSchemeRegistryId) {
      totalRegisteredTopicSchemes
      totalActiveTopicSchemes
      totalRemovedTopicSchemes
    }
  }
`);

const TopicSchemesStatsStateResponseSchema = z.object({
  topicSchemesState: z
    .object({
      totalRegisteredTopicSchemes: z.coerce.number(),
      totalActiveTopicSchemes: z.coerce.number(),
      totalRemovedTopicSchemes: z.coerce.number(),
    })
    .nullable(),
});

export const statsTopicSchemesStatsState =
  systemRouter.system.stats.topicSchemesStatsState.handler(
    async ({ context }) => {
      const topicSchemeRegistryId =
        context.system.topicSchemeRegistry.id.toLowerCase();

      const response = await context.theGraphClient.query(
        TOPIC_SCHEMES_STATS_STATE_QUERY,
        {
          input: {
            topicSchemeRegistryId,
          },
          output: TopicSchemesStatsStateResponseSchema,
        }
      );

      const totalRegisteredTopicSchemes =
        response.topicSchemesState?.totalRegisteredTopicSchemes ?? 0;
      const totalActiveTopicSchemes =
        response.topicSchemesState?.totalActiveTopicSchemes ?? 0;
      const totalRemovedTopicSchemes =
        response.topicSchemesState?.totalRemovedTopicSchemes ?? 0;

      return {
        totalRegisteredTopicSchemes,
        totalActiveTopicSchemes,
        totalRemovedTopicSchemes,
      };
    }
  );

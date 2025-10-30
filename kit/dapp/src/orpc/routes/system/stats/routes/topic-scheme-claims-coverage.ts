import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { systemRouter } from "@/orpc/procedures/system.router";
import { TopicSchemeSchema } from "@/orpc/routes/system/claim-topics/routes/topic.list.schema";
import { z } from "zod";

const TOPIC_SCHEME_CLAIMS_COVERAGE_QUERY = theGraphGraphql(`
  query TopicSchemeClaimsCoverage($topicSchemeRegistryId: ID!, $topicSchemeRegistryIdString: String!) {
    topicSchemesState(id: $topicSchemeRegistryId) {
      totalActiveTopicSchemes
    }
    topicSchemeClaimsStates(
      where: {
        totalActiveClaims: "0"
        topicScheme_: {
          registry: $topicSchemeRegistryIdString
          enabled: true
        }
      }
      orderBy: topicScheme__topicId
      orderDirection: asc
    ) {
      topicScheme {
        id
        name
        topicId
        signature
        enabled
        deployedInTransaction
      }
    }
  }
`);

const TopicSchemeClaimsCoverageResponseSchema = z.object({
  topicSchemesState: z
    .object({
      totalActiveTopicSchemes: z.coerce.number(),
    })
    .nullable(),
  topicSchemeClaimsStates: z.array(
    z.object({
      topicScheme: TopicSchemeSchema.omit({ registry: true }),
    })
  ),
});

export const statsTopicSchemeClaimsCoverage =
  systemRouter.system.stats.topicSchemeClaimsCoverage.handler(
    async ({ context }) => {
      const topicSchemeRegistryId =
        context.system.topicSchemeRegistry.id.toLowerCase();

      const response = await context.theGraphClient.query(
        TOPIC_SCHEME_CLAIMS_COVERAGE_QUERY,
        {
          input: {
            topicSchemeRegistryId,
            topicSchemeRegistryIdString: topicSchemeRegistryId,
          },
          output: TopicSchemeClaimsCoverageResponseSchema,
        }
      );

      const totalActiveTopicSchemes =
        response.topicSchemesState?.totalActiveTopicSchemes ?? 0;
      const missingTopics = response.topicSchemeClaimsStates.map(
        (state) => state.topicScheme
      );

      return {
        totalActiveTopicSchemes,
        missingTopics,
      };
    }
  );

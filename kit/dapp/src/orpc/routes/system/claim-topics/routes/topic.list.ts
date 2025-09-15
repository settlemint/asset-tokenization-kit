import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { systemRouter } from "@/orpc/procedures/system.router";
import {
  TopicListResponseSchema,
  type TopicListOutput,
} from "./topic.list.schema";

/**
 * GraphQL query to fetch all topic schemes from the subgraph
 * Retrieves topic details including ID, name, signature, and registry
 */
const TOPIC_SCHEMES_QUERY = theGraphGraphql(
  `
  query GetTopicSchemes($registryAddress: String!) {
    topicSchemes(
      where: { registry: $registryAddress, enabled: true }
      orderBy: topicId
      orderDirection: asc
    ) @fetchAll {
      id
      topicId
      name
      signature
      registry {
        id
      }
    }
  }
`,
  []
);

/**
 * List all topic schemes from the registry
 *
 * Fetches all registered topic schemes from the subgraph, ordered by topic ID.
 * Includes both system-reserved topics (ID 1-100) and custom topics (ID 101+).
 *
 * @returns Array of topic schemes with their details
 */
export const topicList = systemRouter.system.claimTopics.topicList.handler(
  async ({ context }): Promise<TopicListOutput> => {
    const { system, theGraphClient } = context;

    // Get the topic scheme registry address from the system configuration
    const registryAddress = system.topicSchemeRegistry.id;

    // Query the subgraph for all topic schemes
    const { topicSchemes } = await theGraphClient.query(TOPIC_SCHEMES_QUERY, {
      input: {
        registryAddress,
      },
      output: TopicListResponseSchema,
    });

    // Return the validated topic schemes
    return topicSchemes;
  }
);

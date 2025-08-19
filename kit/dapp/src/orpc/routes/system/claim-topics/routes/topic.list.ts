import { theGraphClient, theGraphGraphql } from "@/lib/settlemint/the-graph";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { portalRouter } from "@/orpc/procedures/portal.router";
import {
  TopicListOutputSchema,
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
      where: { registry: $registryAddress }
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
export const topicList = portalRouter.system.topicList
  .use(systemMiddleware)
  .handler(async ({ context, errors }): Promise<TopicListOutput> => {
    const { system } = context;

    // Get the topic scheme registry address from the system configuration
    const registryAddress = system?.topicSchemeRegistry;
    if (!registryAddress) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "System topic scheme registry not found",
      });
    }

    // Query the subgraph for all topic schemes
    const { topicSchemes } = await theGraphClient.request({
      document: TOPIC_SCHEMES_QUERY,
      variables: {
        registryAddress,
      },
    });

    // Validate and return the topic schemes
    return TopicListOutputSchema.parse(topicSchemes);
  });
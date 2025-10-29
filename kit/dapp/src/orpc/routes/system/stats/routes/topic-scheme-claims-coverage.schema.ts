import { TopicSchemeSchema } from "@/orpc/routes/system/claim-topics/routes/topic.list.schema";
import * as z from "zod";

/**
 * Output schema for topic scheme claims coverage endpoint.
 *
 * Returns statistics about topic schemes that have no active claims,
 * helping identify coverage gaps in the claim system.
 */
export const StatsTopicSchemeClaimsCoverageOutputSchema = z.object({
  /**
   * Total number of active topic schemes in the registry.
   */
  totalActiveTopicSchemes: z.number(),
  /**
   * List of topic schemes that have zero active claims.
   * These represent gaps in claim coverage that may need attention.
   */
  missingTopics: z.array(TopicSchemeSchema.omit({ registry: true })),
});

export type StatsTopicSchemeClaimsCoverageOutput = z.infer<
  typeof StatsTopicSchemeClaimsCoverageOutputSchema
>;

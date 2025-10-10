import { z } from "zod";

/**
 * Output schema for topic schemes stats state endpoint
 */
export const StatsTopicSchemesStatsStateOutputSchema = z.object({
  totalRegisteredTopicSchemes: z.number(),
  totalActiveTopicSchemes: z.number(),
  totalRemovedTopicSchemes: z.number(),
});

export type StatsTopicSchemesStatsStateOutput = z.infer<
  typeof StatsTopicSchemesStatsStateOutputSchema
>;

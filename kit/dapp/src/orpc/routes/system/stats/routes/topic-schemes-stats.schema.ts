import { StatsResolvedRangeSchema } from "@atk/zod/stats-range";
import { timestamp } from "@atk/zod/timestamp";
import { z } from "zod";

export const StatsTopicSchemesStatsOutputSchema = z.object({
  range: StatsResolvedRangeSchema,
  data: z.array(
    z.object({
      timestamp: timestamp(),
      totalRegisteredTopicSchemes: z.number(),
      totalActiveTopicSchemes: z.number(),
      totalRemovedTopicSchemes: z.number(),
    })
  ),
});

export type StatsTopicSchemesStatsOutput = z.infer<
  typeof StatsTopicSchemesStatsOutputSchema
>;

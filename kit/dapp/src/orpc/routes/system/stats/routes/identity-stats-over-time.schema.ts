import { StatsResolvedRangeSchema } from "@atk/zod/stats-range";
import { z } from "zod";

export const StatsIdentityStatsOverTimeOutputSchema = z.object({
  range: StatsResolvedRangeSchema,
  identityStats: z.array(
    z.object({
      timestamp: z.string(),
      activeUserIdentitiesCount: z.number(),
    })
  ),
});

export type StatsIdentityStatsOverTimeOutput = z.infer<
  typeof StatsIdentityStatsOverTimeOutputSchema
>;

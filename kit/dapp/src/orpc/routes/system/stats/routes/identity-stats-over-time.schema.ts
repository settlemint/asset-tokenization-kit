import { StatsResolvedRangeSchema } from "@atk/zod/stats-range";
import { timestamp } from "@atk/zod/timestamp";
import * as z from "zod";

export const StatsIdentityStatsOverTimeOutputSchema = z.object({
  range: StatsResolvedRangeSchema,
  identityStats: z.array(
    z.object({
      timestamp: timestamp(),
      activeUserIdentitiesCount: z.number(),
    })
  ),
});

export type StatsIdentityStatsOverTimeOutput = z.infer<
  typeof StatsIdentityStatsOverTimeOutputSchema
>;

import { timestamp } from "@atk/zod/timestamp";
import { z } from "zod";

export const StatsIdentityStatsOverTimeInputSchema = z.object({
  fromTimestamp: timestamp().describe("Start timestamp"),
  toTimestamp: timestamp().describe("End timestamp").optional(),
});

export const StatsIdentityStatsOverTimeOutputSchema = z.object({
  identityStats: z.array(
    z.object({
      timestamp: z.string(),
      activeUserIdentitiesCount: z.number(),
    })
  ),
});

export type StatsIdentityStatsOverTimeInput = z.infer<
  typeof StatsIdentityStatsOverTimeInputSchema
>;
export type StatsIdentityStatsOverTimeOutput = z.infer<
  typeof StatsIdentityStatsOverTimeOutputSchema
>;

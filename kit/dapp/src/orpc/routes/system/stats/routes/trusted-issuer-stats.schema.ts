import { StatsResolvedRangeSchema } from "@atk/zod/stats-range";
import { timestamp } from "@atk/zod/timestamp";
import * as z from "zod";

export const StatsTrustedIssuerStatsOutputSchema = z.object({
  range: StatsResolvedRangeSchema,
  data: z.array(
    z.object({
      timestamp: timestamp(),
      totalAddedTrustedIssuers: z.number(),
      totalActiveTrustedIssuers: z.number(),
      totalRemovedTrustedIssuers: z.number(),
    })
  ),
});

export type StatsTrustedIssuerStatsOutput = z.infer<
  typeof StatsTrustedIssuerStatsOutputSchema
>;

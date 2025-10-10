import { StatsResolvedRangeSchema } from "@atk/zod/stats-range";
import { timestamp } from "@atk/zod/timestamp";
import { z } from "zod";

export const StatsClaimsStatsOutputSchema = z.object({
  range: StatsResolvedRangeSchema,
  data: z.array(
    z.object({
      timestamp: timestamp(),
      totalIssuedClaims: z.number(),
      totalActiveClaims: z.number(),
      totalRemovedClaims: z.number(),
      totalRevokedClaims: z.number(),
    })
  ),
});

export type StatsClaimsStatsOutput = z.infer<
  typeof StatsClaimsStatsOutputSchema
>;

import { z } from "zod";

/**
 * Output schema for claims stats state endpoint
 */
export const StatsClaimsStatsStateOutputSchema = z.object({
  totalIssuedClaims: z.number(),
  totalActiveClaims: z.number(),
  totalRemovedClaims: z.number(),
  totalRevokedClaims: z.number(),
});

export type StatsClaimsStatsStateOutput = z.infer<
  typeof StatsClaimsStatsStateOutputSchema
>;

import { z } from "zod";

/**
 * Output schema for trusted issuer stats state endpoint
 */
export const StatsTrustedIssuerStatsStateOutputSchema = z.object({
  totalAddedTrustedIssuers: z.number(),
  totalActiveTrustedIssuers: z.number(),
  totalRemovedTrustedIssuers: z.number(),
});

export type StatsTrustedIssuerStatsStateOutput = z.infer<
  typeof StatsTrustedIssuerStatsStateOutputSchema
>;

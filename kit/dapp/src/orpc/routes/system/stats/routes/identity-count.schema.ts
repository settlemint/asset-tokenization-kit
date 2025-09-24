import { z } from "zod";

/**
 * Output schema for system identities created count endpoint
 */
export const StatsIdentityCountOutputSchema = z.object({
  userIdentitiesCreatedCount: z.number(),
  activeUserIdentitiesCount: z.number(),
  pendingIdentitiesCount: z.number(),
});

export type StatsIdentityCountOutput = z.infer<
  typeof StatsIdentityCountOutputSchema
>;

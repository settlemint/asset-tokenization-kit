import { z } from "zod";

/**
 * Input schema for system active identities count endpoint
 */
export const StatsIdentityCountInputSchema = z.object({}).strict();

/**
 * Output schema for system identities created count endpoint
 */
export const StatsIdentityCountOutputSchema = z.object({
  identitiesCreatedCount: z.number(),
  activeIdentitiesCount: z.number(),
  pendingRegistrationsCount: z.number(),
});

export type StatsIdentityCountInput = z.infer<
  typeof StatsIdentityCountInputSchema
>;
export type StatsIdentityCountOutput = z.infer<
  typeof StatsIdentityCountOutputSchema
>;

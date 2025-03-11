import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";
import { z, type ZodInfer } from "@/lib/utils/zod";

/**
 * GraphQL fragment for permission data related to accounts
 *
 * @remarks
 * Contains basic account information for permission checks
 */
export const AccountFragment = theGraphGraphqlKit(`
  fragment AccountFragment on Account {
    id
    lastActivity
    balancesCount
    activityEventsCount
  }
`);

/**
 * Zod schema for validating permission data
 *
 */
export const AccountFragmentSchema = z.object({
  id: z.address(),
  lastActivity: z.timestamp(),
  balancesCount: z.number(),
  activityEventsCount: z.number(),
});

/**
 * Type definition for permission data
 */
export type Account = ZodInfer<typeof AccountFragmentSchema>;

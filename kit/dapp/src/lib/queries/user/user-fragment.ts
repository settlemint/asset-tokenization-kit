import { hasuraGraphql } from '@/lib/settlemint/hasura';
import { z, type ZodInfer } from '@/lib/utils/zod';

/**
 * GraphQL fragment for user data from Hasura
 *
 * @remarks
 * Contains core user properties including ID, name, email, and wallet address
 */
export const UserFragment = hasuraGraphql(`
  fragment UserFragment on user {
    id
    name
    email
    wallet
    created_at
    updated_at
  }
`);

/**
 * Zod schema for validating user data
 *
 * @property {string} id - The unique identifier for the user
 * @property {string|null} name - The user's name (optional)
 * @property {string|null} email - The user's email address (optional)
 * @property {string|null} wallet - The user's wallet address (optional)
 * @property {number} created_at - Timestamp when the user was created
 * @property {number} updated_at - Timestamp when the user was last updated
 */
export const UserFragmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  wallet: z.address(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().nullish(),
});

/**
 * Type definition for user data
 */
export type User = ZodInfer<typeof UserFragmentSchema>;

export const RecentUsersCountFragment = hasuraGraphql(`
  fragment RecentUsersCountFragment on user_aggregate_fields {
      count
  }
`);

export const RecentUsersCountFragmentSchema = z.object({
  count: z.number().default(0),
});

export type RecentUsersCount = ZodInfer<typeof RecentUsersCountFragmentSchema>;

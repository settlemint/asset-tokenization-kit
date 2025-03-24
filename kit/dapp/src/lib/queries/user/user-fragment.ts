import { hasuraGraphql } from "@/lib/settlemint/hasura";
import { type ZodInfer, z } from "@/lib/utils/zod";

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
    kyc_verified_at
    role
    banned
    ban_reason
    ban_expires
    last_login_at
    image
    currency
  }
`);

/**
 * Zod schema for validating user data
 *
 */
export const UserFragmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  wallet: z.address(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().nullish(),
  kyc_verified_at: z.string().nullish(),
  role: z.string(),
  banned: z.boolean().nullish(),
  ban_reason: z.string().nullish(),
  ban_expires: z.coerce.date().nullish(),
  last_login_at: z.string().nullish(),
  image: z.string().nullish(),
  last_activity_at: z.string().nullish(),
  currency: z.fiatCurrency(),
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

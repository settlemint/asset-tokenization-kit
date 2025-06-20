import { hasuraGraphql } from "@/lib/settlemint/hasura";
import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";

export const AccountFragment = theGraphGraphqlKit(`
  fragment AccountFragment on Account {
    id
    lastActivity
    balancesCount
  }
`);

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
    createdAt: created_at
    updatedAt: updated_at
    kycVerifiedAt: kyc_verified_at
    role
    banned
    banReason: ban_reason
    banExpires: ban_expires
    lastLoginAt: last_login_at
    image
    currency
  }
`);

/**
 * GraphQL fragment for user count data from Hasura
 *
 * @remarks
 * Contains count information for user aggregates
 */
export const RecentUsersCountFragment = hasuraGraphql(`
  fragment RecentUsersCountFragment on user_aggregate_fields {
      count
  }
`);

import { hasuraGraphql } from "@/lib/settlemint/hasura";
import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";

export const AccountFragment = theGraphGraphqlKit(`
  fragment AccountFragment on Account {
    id
    lastActivity
    balancesCount
    activityEventsCount
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

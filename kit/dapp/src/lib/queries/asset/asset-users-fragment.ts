import { hasuraGraphql } from "@/lib/settlemint/hasura";
import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";

/**
 * GraphQL fragment for permission data related to accounts
 *
 * @remarks
 * Contains basic account information for permission checks
 */
export const PermissionFragment = theGraphGraphqlKit(`
  fragment PermissionFragment on Account {
    id
    lastActivity
  }
`);

export const AllowedUserFragment = theGraphGraphqlKit(`
  fragment AllowedUserFragment on AllowedUser    {
    id
    user {
      id
    }
    allowedAt
  }
`);

export const BlockedUserFragment = theGraphGraphqlKit(`
  fragment BlockedUserFragment on BlockedUser {
    id
    user {
      id
    }
    blockedAt
  }
`);

/**
 * GraphQL fragment for on-chain asset data from The Graph
 *
 * @remarks
 * Contains core asset properties and permission relationships
 */
export const AssetUsersFragment = theGraphGraphqlKit(
  `
  fragment AssetUsersFragment on Asset {
    id
    name
    symbol
    type
    decimals
    admins {
      ...PermissionFragment
    }
    supplyManagers {
      ...PermissionFragment
    }
    userManagers {
      ...PermissionFragment
    }
    blocklist {
      ...BlockedUserFragment
    }
    allowlist {
      ...AllowedUserFragment
    }
    holders {
      id
      value
      account {
        id
      }
    }
  }
`,
  [PermissionFragment, BlockedUserFragment, AllowedUserFragment]
);

/**
 * GraphQL fragment for off-chain asset data from Hasura
 *
 * @remarks
 * Contains additional metadata about assets stored in the database
 */
export const OffchainAssetFragment = hasuraGraphql(`
  fragment OffchainAssetFragment on asset {
    id
    isin
    value_in_base_currency
  }
`);

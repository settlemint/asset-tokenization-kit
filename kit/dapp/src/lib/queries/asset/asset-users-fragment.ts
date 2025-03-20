import { hasuraGraphql } from "@/lib/settlemint/hasura";
import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";
import { type ZodInfer, z } from "@/lib/utils/zod";

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

/**
 * Zod schema for validating permission data
 *
 */
export const PermissionFragmentSchema = z.object({
  id: z.address(),
  lastActivity: z.timestamp(),
});

/**
 * Type definition for permission data
 */
export type Permission = ZodInfer<typeof PermissionFragmentSchema>;

export const AllowedUserFragment = theGraphGraphqlKit(`
  fragment AllowedUserFragment on AllowedUser    {
    id
    user {
      id
    }
    allowedAt
  }
`);

export const AllowedUserFragmentSchema = z.object({
  id: z.string(),
  user: z.object({
    id: z.address(),
  }),
  allowedAt: z.timestamp(),
});

export type AllowedUser = ZodInfer<typeof AllowedUserFragmentSchema>;

export const BlockedUserFragment = theGraphGraphqlKit(`
  fragment BlockedUserFragment on BlockedUser {
    id
    user {
      id
    }
    blockedAt
  }
`);

export const BlockedUserFragmentSchema = z.object({
  id: z.string(),
  user: z.object({
    id: z.address(),
  }),
  blockedAt: z.timestamp(),
});

export type BlockedUser = ZodInfer<typeof BlockedUserFragmentSchema>;

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
 * Zod schema for validating on-chain asset data
 *
 */
export const AssetUsersFragmentSchema = z.object({
  id: z.address(),
  name: z.string(),
  symbol: z.symbol(),
  type: z.assetType(),
  decimals: z.number(),
  admins: z.array(PermissionFragmentSchema),
  supplyManagers: z.array(PermissionFragmentSchema),
  userManagers: z.array(PermissionFragmentSchema),
  holders: z.array(
    z.object({
      id: z.string(),
      value: z.string(),
      account: z.object({
        id: z.address(),
      }),
    })
  ),
});

/**
 * Type definition for on-chain asset data
 */
export type AssetUsers = ZodInfer<typeof AssetUsersFragmentSchema>;

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

/**
 * Zod schema for validating off-chain asset data
 *
 */
export const OffchainAssetFragmentSchema = z.object({
  id: z.address(),
  isin: z.isin().nullish(),
  value_in_base_currency: z.fiatCurrencyAmount(),
});

/**
 * Type definition for off-chain asset data
 */
export type OffchainAsset = ZodInfer<typeof OffchainAssetFragmentSchema>;

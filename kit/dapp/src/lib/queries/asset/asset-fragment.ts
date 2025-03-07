import { hasuraGraphql } from "@/lib/settlemint/hasura";
import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";
import { z, type ZodInfer } from "@/lib/utils/zod";

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

/**
 * GraphQL fragment for on-chain asset data from The Graph
 *
 * @remarks
 * Contains core asset properties and permission relationships
 */
export const AssetFragment = theGraphGraphqlKit(
  `
  fragment AssetFragment on Asset {
    id
    name
    symbol
    type
    admins {
      ...PermissionFragment
    }
    supplyManagers {
      ...PermissionFragment
    }
    userManagers {
      ...PermissionFragment
    }
  }
`,
  [PermissionFragment]
);

/**
 * Zod schema for validating on-chain asset data
 *
 */
export const AssetFragmentSchema = z.object({
  id: z.address(),
  name: z.string(),
  symbol: z.symbol(),
  type: z.assetType(),
  admins: z.array(PermissionFragmentSchema),
  supplyManagers: z.array(PermissionFragmentSchema),
  userManagers: z.array(PermissionFragmentSchema),
});

/**
 * Type definition for on-chain asset data
 */
export type Asset = ZodInfer<typeof AssetFragmentSchema>;

/**
 * GraphQL fragment for off-chain asset data from Hasura
 *
 * @remarks
 * Contains additional metadata about assets stored in the database
 */
export const OffchainAssetFragment = hasuraGraphql(`
  fragment OffchainAssetFragment on asset {
    id
  }
`);

/**
 * Zod schema for validating off-chain asset data
 *
 */
export const OffchainAssetFragmentSchema = z.object({
  id: z.address(),
});

/**
 * Type definition for off-chain asset data
 */
export type OffchainAsset = ZodInfer<typeof OffchainAssetFragmentSchema>;

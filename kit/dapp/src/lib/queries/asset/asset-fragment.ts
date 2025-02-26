import { theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { z, type ZodInfer } from '@/lib/utils/zod';

/**
 * GraphQL fragment for permission data related to accounts
 *
 * @remarks
 * Contains basic account information for permission checks
 */
export const PermissionFragment = theGraphGraphqlStarterkits(`
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
 * GraphQL fragment for asset data
 *
 * @remarks
 * Contains core asset properties and permission relationships
 */
export const AssetFragment = theGraphGraphqlStarterkits(
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
 * Zod schema for validating asset data
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
 * Type definition for asset data
 */
export type Asset = ZodInfer<typeof AssetFragmentSchema>;

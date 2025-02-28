import type { Role } from '@/lib/config/roles';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { safeParseWithLogging } from '@/lib/utils/zod';
import { unstable_cache } from 'next/cache';
import { type Address, getAddress } from 'viem';
import {
  AssetFragment,
  AssetFragmentSchema,
  OffchainAssetFragment,
  OffchainAssetFragmentSchema,
  type Permission,
  PermissionFragmentSchema,
} from './asset-fragment';

/**
 * GraphQL query to fetch on-chain asset details from The Graph
 */
const AssetDetail = theGraphGraphqlStarterkits(
  `
  query AssetDetail($id: ID!) {
    asset(id: $id) {
      ...AssetFragment
    }
  }
`,
  [AssetFragment]
);

/**
 * GraphQL query to fetch off-chain asset details from Hasura
 */
const OffchainAssetDetail = hasuraGraphql(
  `
  query OffchainAssetDetail($id: String!) {
    asset(where: {id: {_eq: $id}}, limit: 1) {
      ...OffchainAssetFragment
    }
  }
`,
  [OffchainAssetFragment]
);

/**
 * Props interface for asset detail components
 */
export interface AssetDetailProps {
  /** Ethereum address of the asset contract */
  address: Address;
}

/**
 * Extended permission interface that includes assigned roles
 */
export interface PermissionWithRoles extends Permission {
  /** List of roles assigned to this permission */
  roles: Role[];
}

/**
 * Cached function to fetch asset raw data from both sources
 */
const fetchAssetData = unstable_cache(
  async (address: Address, normalizedAddress: Address) => {
    const onchainData = await theGraphClientStarterkits.request(AssetDetail, {
      id: address,
    });
    const offchainData = await hasuraClient.request(OffchainAssetDetail, {
      id: normalizedAddress,
    });

    return {
      onchainData,
      offchainData,
    };
  },
  ['asset', 'detail'],
  {
    revalidate: 60 * 60,
    tags: ['asset'],
  }
);

/**
 * Fetches and combines on-chain and off-chain asset data with permission information
 *
 * @param params - Object containing the asset address
 * @returns Combined asset data with additional permission details
 * @throws Error if fetching or parsing fails
 */
export async function getAssetDetail({ address }: AssetDetailProps) {
  const normalizedAddress = getAddress(address);

  const { onchainData, offchainData } = await fetchAssetData(
    address,
    normalizedAddress
  );

  if (!onchainData.asset) {
    throw new Error(`Asset ${address} not found`);
  }

  // Parse and validate the asset data with Zod schema
  const validatedAsset = safeParseWithLogging(
    AssetFragmentSchema,
    onchainData.asset,
    'asset'
  );

  const offchainAsset = offchainData.asset[0]
    ? safeParseWithLogging(
        OffchainAssetFragmentSchema,
        offchainData.asset[0],
        'offchain asset'
      )
    : undefined;

  // Define the role configurations
  const roleConfigs = [
    {
      permissions: validatedAsset.admins,
      role: 'DEFAULT_ADMIN_ROLE' as const,
    },
    {
      permissions: validatedAsset.supplyManagers,
      role: 'SUPPLY_MANAGEMENT_ROLE' as const,
    },
    {
      permissions: validatedAsset.userManagers,
      role: 'USER_MANAGEMENT_ROLE' as const,
    },
  ];

  // Create a map to track users with their roles
  const usersWithRoles = new Map<string, PermissionWithRoles>();

  // Process all role configurations
  roleConfigs.forEach(({ permissions, role }) => {
    const validatedPermissions = permissions.map((permission) =>
      safeParseWithLogging(PermissionFragmentSchema, permission, 'permission')
    );
    validatedPermissions.forEach((validatedPermission) => {
      const userId = validatedPermission.id;
      const existing = usersWithRoles.get(userId);

      if (existing) {
        if (!existing.roles.includes(role)) {
          existing.roles.push(role);
        }
      } else {
        usersWithRoles.set(userId, {
          ...validatedPermission,
          roles: [role],
        });
      }
    });
  });

  return {
    ...validatedAsset,
    ...{
      private: false,
      ...offchainAsset,
    },
    roles: Array.from(usersWithRoles.values()),
  };
}

/**
 * Fetches a user by ID, returning null if not found
 *
 * @param params - Object containing the user ID
 */
export async function getOptionalAssetDetail({ address }: AssetDetailProps) {
  try {
    return await getAssetDetail({ address });
  } catch {
    return null;
  }
}

import type { Role } from '@/lib/config/roles';
import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { safeParseWithLogging } from '@/lib/utils/zod';
import { useSuspenseQuery } from '@tanstack/react-query';
import { type Address, getAddress } from 'viem';
import {
  AssetFragment,
  AssetFragmentSchema,
  type Permission,
  PermissionFragmentSchema,
} from './asset-fragment';

/**
 * GraphQL query to fetch asset details from The Graph
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
 * Fetches and processes asset data with permission information
 *
 * @param params - Object containing the asset address
 * @returns Processed asset data with consolidated role information
 * @throws Error if fetching or parsing fails
 */
async function getAssetDetail({ address }: AssetDetailProps) {
  try {
    const result = await theGraphClientStarterkits.request(AssetDetail, {
      id: address,
    });

    if (!result.asset) {
      throw new Error(`Asset ${address} not found`);
    }

    // Parse and validate the asset data with Zod schema
    const validatedAsset = safeParseWithLogging(
      AssetFragmentSchema,
      result.asset,
      'asset'
    );

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
      roles: Array.from(usersWithRoles.values()),
    };
  } catch (_error) {
    // Re-throw with more context
    throw _error instanceof Error
      ? _error
      : new Error(`Failed to fetch asset ${address}`);
  }
}

/**
 * Generates a consistent query key for asset detail queries
 *
 * @param params - Object containing the asset address
 * @returns Array representing the query key for React Query
 */
const getQueryKey = ({ address }: AssetDetailProps) =>
  ['asset', getAddress(address)] as const;

/**
 * React Query hook for fetching asset details
 *
 * @param params - Object containing the asset address
 * @returns Query result with asset data and query key
 */
export function useAssetDetail({ address }: AssetDetailProps) {
  const queryKey = getQueryKey({ address });

  const result = useSuspenseQuery({
    queryKey,
    queryFn: () => getAssetDetail({ address }),
  });

  return {
    ...result,
    queryKey,
  };
}

/**
 * React Query hook for optionally fetching asset details
 * Returns null instead of throwing if the asset cannot be found
 *
 * @param params - Object containing the asset address
 * @returns Query result with asset data or null if not found
 */
export function useOptionalAssetDetail({ address }: AssetDetailProps) {
  try {
    return useAssetDetail({ address });
  } catch {
    return null;
  }
}

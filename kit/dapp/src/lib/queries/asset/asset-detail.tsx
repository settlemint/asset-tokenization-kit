import type { Role } from "@/lib/config/roles";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { safeParseWithLogging } from "@/lib/utils/zod";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { type Address, getAddress } from "viem";
import {
  AssetFragment,
  AssetFragmentSchema,
  OffchainAssetFragment,
  OffchainAssetFragmentSchema,
  type Permission,
  PermissionFragmentSchema,
} from "./asset-fragment";
/**
 * GraphQL query to fetch on-chain asset details from The Graph
 */
const AssetDetail = theGraphGraphqlKit(
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
  /** Name of the asset */
  assetName: string;
}

/**
 * Fetches and combines on-chain and off-chain asset data with permission information
 *
 * @param params - Object containing the asset address
 * @returns Combined asset data with additional permission details
 * @throws Error if fetching or parsing fails
 */
export const getAssetDetail = cache(async ({ address }: AssetDetailProps) => {
  const normalizedAddress = getAddress(address);

  const [onchainData, offchainData] = await Promise.all([
    unstable_cache(
      () => theGraphClientKit.request(AssetDetail, { id: address }),
      ["asset", "asset-detail", address],
      {
        revalidate: 60 * 60 * 24, // 24 hours
        tags: ["asset"],
      }
    )(),
    unstable_cache(
      () =>
        hasuraClient.request(OffchainAssetDetail, { id: normalizedAddress }),
      ["asset", "offchain-asset-detail", normalizedAddress],
      {
        revalidate: 60 * 60 * 24, // 24 hours
        tags: ["asset"],
      }
    )(),
  ]);

  if (!onchainData.asset) {
    throw new Error(`Asset ${address} not found`);
  }

  // Parse and validate the asset data with Zod schema
  const validatedAsset = safeParseWithLogging(
    AssetFragmentSchema,
    onchainData.asset,
    "asset"
  );

  const offchainAsset = offchainData.asset[0]
    ? safeParseWithLogging(
        OffchainAssetFragmentSchema,
        offchainData.asset[0],
        "offchain asset"
      )
    : undefined;

  // Define the role configurations
  const roleConfigs = [
    {
      permissions: validatedAsset.admins,
      role: "DEFAULT_ADMIN_ROLE" as const,
    },
    {
      permissions: validatedAsset.supplyManagers,
      role: "SUPPLY_MANAGEMENT_ROLE" as const,
    },
    {
      permissions: validatedAsset.userManagers,
      role: "USER_MANAGEMENT_ROLE" as const,
    },
  ];

  // Create a map to track users with their roles
  const usersWithRoles = new Map<string, PermissionWithRoles>();

  // Process all role configurations
  roleConfigs.forEach(({ permissions, role }) => {
    const validatedPermissions = permissions.map((permission) =>
      safeParseWithLogging(PermissionFragmentSchema, permission, "permission")
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
          assetName: validatedAsset.name,
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
});

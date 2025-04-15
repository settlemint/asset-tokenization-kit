import "server-only";

import type { Role } from "@/lib/config/roles";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox/index";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { cache } from "react";
import { getAddress, type Address } from "viem";
import {
  AssetUsersFragment,
  OffchainAssetFragment,
} from "./asset-users-fragment";
import {
  AssetUsersSchema,
  OffchainAssetSchema,
  PermissionSchema,
  type Permission,
} from "./asset-users-schema";
/**
 * GraphQL query to fetch on-chain asset details from The Graph
 */
const AssetDetail = theGraphGraphqlKit(
  `
  query AssetDetail($id: ID!) {
    asset(id: $id) {
      ...AssetUsersFragment
    }
  }
`,
  [AssetUsersFragment]
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
export const getAssetUsersDetail = withTracing(
  "queries",
  "getAssetUsersDetail",
  cache(async ({ address }: AssetDetailProps) => {
    "use cache";
    cacheTag("asset");
    const normalizedAddress = getAddress(address);

    const [onchainData, offchainData] = await Promise.all([
      theGraphClientKit.request(
        AssetDetail,
        {
          id: address,
        },
        {
          "X-GraphQL-Operation-Name": "AssetDetail",
          "X-GraphQL-Operation-Type": "query",
        }
      ),
      hasuraClient.request(
        OffchainAssetDetail,
        {
          id: normalizedAddress,
        },
        {
          "X-GraphQL-Operation-Name": "OffchainAssetDetail",
          "X-GraphQL-Operation-Type": "query",
        }
      ),
    ]);

    if (!onchainData.asset) {
      throw new Error(`Asset ${address} not found`);
    }

    // Parse and validate the asset data with TypeBox schema
    const validatedAsset = safeParse(AssetUsersSchema, onchainData.asset);

    const offchainAsset = offchainData.asset[0]
      ? safeParse(OffchainAssetSchema, offchainData.asset[0])
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
      {
        permissions: validatedAsset.auditors,
        role: "AUDITOR_ROLE" as const,
      },
    ];

    // Create a map to track users with their roles
    const usersWithRoles = new Map<string, PermissionWithRoles>();

    // Process all role configurations
    for (const { permissions, role } of roleConfigs) {
      const validatedPermissions =
        permissions?.map((permission: unknown) =>
          safeParse(PermissionSchema, permission)
        ) ?? [];
      for (const validatedPermission of validatedPermissions) {
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
      }
    }

    return {
      ...validatedAsset,
      ...{
        private: false,
        ...offchainAsset,
      },
      roles: Array.from(usersWithRoles.values()),
    };
  })
);

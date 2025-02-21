import type { Role } from '@/lib/config/roles';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { fetchAllTheGraphPages } from '@/lib/utils/pagination';
import type { FragmentOf } from '@settlemint/sdk-thegraph';

export const PermissionFragment = theGraphGraphqlStarterkits(`
  fragment PermissionFragment on Account {
    id
    lastActivity
  }
`);

const PermissionsQuery = theGraphGraphqlStarterkits(
  `
  query AssetPermissions($id: ID!, $first: Int, $skip: Int) {
    asset(id: $id) {
      id
      type
      name
      symbol
      admins(first: $first, skip: $skip) {
        ...PermissionFragment
      }
      supplyManagers(first: $first, skip: $skip) {
        ...PermissionFragment
      }
      userManagers(first: $first, skip: $skip) {
        ...PermissionFragment
      }
    }
  }
`,
  [PermissionFragment]
);

export interface PermissionWithRoles extends Permission {
  roles: Role[];
}

function addPermission(permissionsMap: Map<string, PermissionWithRoles>, permission: Permission, role: Role): void {
  if (permissionsMap.has(permission.id)) {
    const existing = permissionsMap.get(permission.id)!;
    if (!existing.roles.includes(role)) {
      existing.roles.push(role);
    }
  } else {
    permissionsMap.set(permission.id, {
      ...permission,
      roles: [role],
    });
  }
}

export async function getPermissions(assetId: string): Promise<PermissionWithRoles[]> {
  const permissionsMap = new Map<string, PermissionWithRoles>();

  // Fetch admins with pagination
  await fetchAllTheGraphPages(async (first, skip) => {
    const result = await theGraphClientStarterkits.request(PermissionsQuery, { id: assetId, first, skip });

    if (result?.asset) {
      for (const admin of result.asset.admins ?? []) {
        addPermission(permissionsMap, admin, 'DEFAULT_ADMIN_ROLE');
      }
      for (const manager of result.asset.supplyManagers ?? []) {
        addPermission(permissionsMap, manager, 'SUPPLY_MANAGEMENT_ROLE');
      }
      for (const manager of result.asset.userManagers ?? []) {
        addPermission(permissionsMap, manager, 'USER_MANAGEMENT_ROLE');
      }
    }

    // Return any array to satisfy the pagination function
    return result?.asset?.admins ?? [];
  });

  return Array.from(permissionsMap.values());
}

export type Permission = FragmentOf<typeof PermissionFragment>;

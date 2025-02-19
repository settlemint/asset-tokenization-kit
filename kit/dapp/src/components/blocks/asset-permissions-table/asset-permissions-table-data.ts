import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';

export const PermissionFragment = theGraphGraphqlStarterkits(`
  fragment PermissionFragment on Account {
    id
    lastActivity
  }
`);

const PermissionsQuery = theGraphGraphqlStarterkits(
  `
  query AssetPermissions($id: ID!) {
    asset(id: $id) {
      id
      type
      name
      symbol
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
  }
`,
  [PermissionFragment]
);

export type PermissionRole = 'admin' | 'supplyManager' | 'userManager';

export interface PermissionWithRoles extends Permission {
  roles: PermissionRole[];
}

function addPermission(
  permissionsMap: Map<string, PermissionWithRoles>,
  permission: Permission,
  role: PermissionRole
): void {
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
  const result = await theGraphClientStarterkits.request(PermissionsQuery, { id: assetId });
  const permissionsMap = new Map<string, PermissionWithRoles>();

  for (const admin of result?.asset?.admins ?? []) {
    addPermission(permissionsMap, admin, 'admin');
  }
  for (const manager of result?.asset?.supplyManagers ?? []) {
    addPermission(permissionsMap, manager, 'supplyManager');
  }
  for (const manager of result?.asset?.userManagers ?? []) {
    addPermission(permissionsMap, manager, 'userManager');
  }

  return Array.from(permissionsMap.values());
}

export type Permission = FragmentOf<typeof PermissionFragment>;

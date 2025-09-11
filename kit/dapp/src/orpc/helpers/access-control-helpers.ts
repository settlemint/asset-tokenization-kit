import type {
  AccessControl,
  AccessControlRoles,
} from "@atk/zod/access-control-roles";

/**
 * Type guard to check if a value is an array of objects with id and isContract properties
 */
function isAccountArray(
  value: unknown
): value is Array<{ id: string; isContract: boolean }> {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "id" in item &&
        typeof item.id === "string" &&
        "isContract" in item &&
        typeof item.isContract === "boolean"
    )
  );
}

/**
 * Safely gets account entries from AccessControl object
 * @param accessControl - The access control object from The Graph
 * @returns Array of tuples containing role name and accounts array
 */
export function getAccessControlEntries(
  accessControl: AccessControl | null | undefined
): Array<[AccessControlRoles, Array<{ id: string; isContract: boolean }>]> {
  if (!accessControl) {
    return [];
  }

  const entries = Object.entries(accessControl);

  const validEntries: Array<
    [AccessControlRoles, Array<{ id: string; isContract: boolean }>]
  > = [];

  for (const [role, value] of entries) {
    // Skip GraphQL internal fields and the 'id' field
    if (role.startsWith("__") || role === "id") {
      continue;
    }

    if (isAccountArray(value)) {
      validEntries.push([role as AccessControlRoles, value]);
    } else {
      // Skip invalid entries silently - this could happen if the GraphQL schema changes
      // or if there are internal fields we don't know about
    }
  }

  return validEntries;
}

/**
 * Checks if a wallet address has a specific role
 * @param wallet - The wallet address to check (will be lowercased)
 * @param role - The role to check for
 * @param accessControl - The access control object from The Graph
 * @returns true if the wallet has the role
 */
export function hasRole(
  wallet: string,
  role: AccessControlRoles,
  accessControl: AccessControl | null | undefined
): boolean {
  if (!accessControl) {
    return false;
  }

  const roleAccounts = accessControl[role];

  if (!isAccountArray(roleAccounts)) {
    // Unexpected value type for role in AccessControl - skip silently
    return false;
  }

  return roleAccounts.some(
    (account) => account.id.toLowerCase() === wallet.toLowerCase()
  );
}

/**
 * Gets all roles for a wallet address
 * @param wallet - The wallet address to check (will be lowercased)
 * @param accessControl - The access control object from The Graph
 * @returns Array of roles the wallet has
 */
export function getUserRoles(
  wallet: string,
  accessControl: AccessControl | null | undefined
): AccessControlRoles[] {
  const walletLower = wallet.toLowerCase();
  const roles: AccessControlRoles[] = [];

  for (const [role, accounts] of getAccessControlEntries(accessControl)) {
    if (accounts.some((account) => account.id.toLowerCase() === walletLower)) {
      roles.push(role);
    }
  }

  return roles;
}

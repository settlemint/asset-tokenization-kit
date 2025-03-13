import { type Hex, keccak256, stringToBytes } from "viem";

/**
 * Role configuration for the access control system.
 * Maps frontend role keys to their smart contract identifiers and display names.
 *
 * DEFAULT_ADMIN_ROLE (0x00) is a special constant in OpenZeppelin's AccessControl contract
 * that has permission to grant and revoke all roles, including itself.
 * See: https://docs.openzeppelin.com/contracts/4.x/api/access#AccessControl
 */
export const ROLES = {
  DEFAULT_ADMIN_ROLE: {
    id: "0x0000000000000000000000000000000000000000000000000000000000000000" as Hex,
    contractRole: "DEFAULT_ADMIN_ROLE",
    displayName: "Admin",
    description:
      "Grants full administrative privileges, including the ability to assign and manage all other roles",
  },
  SUPPLY_MANAGEMENT_ROLE: {
    id: keccak256(stringToBytes("SUPPLY_MANAGEMENT_ROLE")),
    contractRole: "SUPPLY_MANAGEMENT_ROLE",
    displayName: "Supply Manager",
    description:
      "Permits the account to mint new tokens, increasing the supply of the asset",
  },
  USER_MANAGEMENT_ROLE: {
    id: keccak256(stringToBytes("USER_MANAGEMENT_ROLE")),
    contractRole: "USER_MANAGEMENT_ROLE",
    displayName: "User Manager",
    description:
      "Allows the account to block and unblock users and to freeze and unfreeze accounts.",
  },
} as const;

// Type for role keys (e.g., 'DEFAULT_ADMIN_ROLE', 'SUPPLY_MANAGEMENT_ROLE', etc.)
export type RoleKey = keyof typeof ROLES;

// Type for the frontend-friendly role identifier
export type Role = (typeof ROLES)[RoleKey]["contractRole"];

// Helper function to get role identifier for contract interactions
export const getRoleIdentifier = (roleKey: RoleKey): Hex => {
  return ROLES[roleKey].id;
};

// Helper function to get display name for UI
export const getRoleDisplayName = (roleKey: RoleKey): string => {
  if (!ROLES[roleKey]) {
    console.error("Unknown role key", roleKey);
    return "";
  }
  return ROLES[roleKey].displayName;
};

export const getActiveRoles = (
  roles?: Partial<Record<Role, boolean>>
): Role[] => {
  if (!roles) return [];

  return Object.keys(roles).filter((role) => roles[role as RoleKey]) as Role[];
};

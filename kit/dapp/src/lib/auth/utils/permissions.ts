import type { Subset } from "better-auth/plugins/access";
import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

const customPermissions = {
  ...defaultStatements,
  setting: ["read", "list", "upsert", "remove"],
  system: ["read", "list", "create"],
  exchangeRates: ["read", "list", "remove", "sync", "update"],
} as const;

type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };
export type Permissions = Subset<
  keyof typeof customPermissions,
  DeepWriteable<typeof customPermissions>
>;

export const accessControl = createAccessControl(customPermissions);

/**
 * Admin role with all permissions.
 * Can manage the system and its settings.
 */
export const adminRole = accessControl.newRole({
  ...adminAc.statements,
  setting: ["read", "list", "upsert", "remove"],
  system: ["read", "list", "create"],
  exchangeRates: ["read", "list", "remove", "sync", "update"],
});

/**
 * User role, regular user on the platform.
 */
export const userRole = accessControl.newRole({
  setting: ["read", "list"],
  system: ["read", "list"],
  exchangeRates: ["read", "list"],
});

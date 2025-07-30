import type { Subset } from "better-auth/plugins/access";
import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

const customPermissions = {
  ...defaultStatements,
  account: ["list"],
  kyc: ["list", "upsert", "remove"],
  setting: ["read", "update"],
  system: ["read", "create"],
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
  account: ["list"],
  kyc: ["list", "upsert", "remove"],
  setting: ["read", "update"],
  system: ["read", "create"],
});

/**
 * Trusted issuer role, this user will verify the kyc of the users.
 * Typically this will be a trusted issuer on chain.
 */
export const issuerRole = accessControl.newRole({
  account: ["list"],
  kyc: ["list", "upsert", "remove"],
  setting: ["read"],
  system: ["read"],
  user: ["list"],
});

/**
 * Investor role, regular user on the platform.
 */
export const investorRole = accessControl.newRole({
  setting: ["read"],
  system: ["read"],
});

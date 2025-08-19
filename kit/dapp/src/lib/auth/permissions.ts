import type { Subset } from "better-auth/plugins/access";
import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

const customPermissions = {
  ...defaultStatements,
  account: ["read", "list", "create-identity"],
  kyc: ["list", "upsert", "remove"],
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
  account: ["read", "list", "create-identity"],
  kyc: ["list", "upsert", "remove"],
  setting: ["read", "list", "upsert", "remove"],
  system: ["read", "list", "create"],
  exchangeRates: ["read", "list", "remove", "sync", "update"],
});

/**
 * Trusted issuer role, this user will verify the kyc of the users.
 * Typically this will be a trusted issuer on chain.
 */
export const issuerRole = accessControl.newRole({
  account: ["read", "list"],
  kyc: ["list", "upsert", "remove"],
  setting: ["read", "list"],
  system: ["read", "list"],
  exchangeRates: ["read", "list"],
  user: ["list"],
});

/**
 * Investor role, regular user on the platform.
 */
export const investorRole = accessControl.newRole({
  setting: ["read", "list"],
  system: ["read", "list"],
  exchangeRates: ["read", "list"],
});

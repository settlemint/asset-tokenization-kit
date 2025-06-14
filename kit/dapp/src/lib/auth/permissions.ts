import type { Subset } from "better-auth/plugins/access";
import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

// TODO JAN: we do not add hooks to create wallets and identities. We handle those out of band during user onboarding.

const customPermissions = {
  ...defaultStatements,
  // TODO JAN: colocate the options with the contract/route in ORPC or automate in some way?
  system: ["create", "read", "update", "delete"],
  transaction: ["read", "watch"],
} as const;

type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };
export type Permissions = Subset<
  keyof typeof customPermissions,
  DeepWriteable<typeof customPermissions>
>;

export const accessControl = createAccessControl(customPermissions);

export const adminRole = accessControl.newRole({
  ...adminAc.statements,
  system: ["create", "read", "update", "delete"],
  transaction: ["read", "watch"],
});

export const issuerRole = accessControl.newRole({
  system: ["create", "read", "update", "delete"],
  transaction: ["read", "watch"],
});

export const investorRole = accessControl.newRole({
  system: ["create", "read", "update", "delete"],
  transaction: ["read", "watch"],
});

export const auditorRole = accessControl.newRole({
  system: ["read"],
  transaction: ["read"],
});

export const userRole = accessControl.newRole({
  system: ["read"],
  transaction: ["read"],
});

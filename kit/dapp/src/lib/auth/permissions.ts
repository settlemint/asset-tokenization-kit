import type { Subset } from "better-auth/plugins/access";
import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

const customPermissions = {
  ...defaultStatements,
  user: [...defaultStatements.user, "set-kyc-status"],
  asset: ["transfer", "manage"],
} as const;

type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };
export type Permissions = Subset<
  keyof typeof customPermissions,
  DeepWriteable<typeof customPermissions>
>;

export const accessControl = createAccessControl(customPermissions);

export const adminRole = accessControl.newRole({
  asset: ["transfer", "manage"],
  ...adminAc.statements,
  user: [...adminAc.statements.user, "set-kyc-status"],
});

export const issuerRole = accessControl.newRole({
  asset: ["transfer", "manage"],
  user: ["list"],
});

export const userRole = accessControl.newRole({
  asset: ["transfer"],
});

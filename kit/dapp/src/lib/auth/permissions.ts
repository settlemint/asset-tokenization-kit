import type { Subset } from "better-auth/plugins/access";
import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

const customPermissions = {
  ...defaultStatements,
  setting: ["read", "update"],
} as const;

type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };
export type Permissions = Subset<
  keyof typeof customPermissions,
  DeepWriteable<typeof customPermissions>
>;

export const accessControl = createAccessControl(customPermissions);

export const adminRole = accessControl.newRole({
  ...adminAc.statements,
  setting: ["read", "update"],
});

export const issuerRole = accessControl.newRole({
  user: ["list"],
  setting: ["read"],
});

export const userRole = accessControl.newRole({
  setting: ["read"],
});

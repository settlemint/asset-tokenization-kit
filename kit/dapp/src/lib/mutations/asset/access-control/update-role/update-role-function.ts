import type { User } from "@/lib/auth/types";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import { RoleMap } from "@/lib/utils/typebox/roles";
import { grantRoleFunction } from "../grant-role/grant-role-function";
import { revokeRoleFunction } from "../revoke-role/revoke-role-function";
import type { UpdateRolesInput } from "./update-role-schema";

/**
 * Function to update roles for a user on an asset
 *
 * @param input - Validated input for updating roles
 * @returns Array of transaction hashes
 */
export const updateRolesFunction = withAccessControl(
  {
    requiredPermissions: {
      asset: ["manage"],
    },
  },
  async ({
    parsedInput: {
      address,
      roles,
      userAddress,
      verificationCode,
      verificationType,
      assettype,
    },
    ctx,
  }: {
    parsedInput: UpdateRolesInput;
    ctx: { user: User };
  }) => {
    // Separate roles to grant and revoke
    const rolesToEnable: RoleMap = {
      DEFAULT_ADMIN_ROLE: false,
      SUPPLY_MANAGEMENT_ROLE: false,
      USER_MANAGEMENT_ROLE: false,
      AUDITOR_ROLE: false,
    };
    const rolesToDisable: RoleMap = {
      DEFAULT_ADMIN_ROLE: false,
      SUPPLY_MANAGEMENT_ROLE: false,
      USER_MANAGEMENT_ROLE: false,
      AUDITOR_ROLE: false,
    };

    for (const [role, enabled] of Object.entries(roles)) {
      if (enabled) {
        rolesToEnable[role as keyof RoleMap] = true;
      } else {
        rolesToDisable[role as keyof RoleMap] = true;
      }
    }

    const txns: string[] = [];

    const hasRolesToGrant = Object.keys(rolesToEnable).length > 0;
    if (hasRolesToGrant) {
      const grantResult = await grantRoleFunction({
        parsedInput: {
          address,
          roles: rolesToEnable,
          userAddress,
          verificationCode,
          verificationType,
          assettype,
        },
        ctx,
      });
      if (grantResult) {
        txns.push(...grantResult);
      }
    }

    const hasRolesToRevoke = Object.keys(rolesToDisable).length > 0;
    if (hasRolesToRevoke) {
      const revokeResult = await revokeRoleFunction({
        parsedInput: {
          address,
          roles: rolesToDisable,
          userAddress,
          verificationCode,
          verificationType,
          assettype,
        },
        ctx,
      });

      if (revokeResult) {
        txns.push(...revokeResult);
      }
    }

    return safeParse(t.Hashes(), txns);
  }
);

import type { User } from "@/lib/auth/types";
import { safeParse, t } from "@/lib/utils/typebox";
import { RoleMap } from "@/lib/utils/typebox/roles";
import { grantRole } from "../grant-role/grant-role-action";
import { revokeRole } from "../revoke-role/revoke-role-action";
import type { UpdateRolesInput } from "./update-role-schema";

/**
 * Function to update roles for a user on an asset
 *
 * @param input - Validated input for updating roles
 * @returns Array of transaction hashes
 */
export async function updateRolesFunction({
  parsedInput: { address, roles, userAddress, pincode, assettype },
}: {
  parsedInput: UpdateRolesInput;
  ctx: { user: User };
}) {
  // Separate roles to grant and revoke
  const rolesToEnable: RoleMap = {
    DEFAULT_ADMIN_ROLE: false,
    SUPPLY_MANAGEMENT_ROLE: false,
    USER_MANAGEMENT_ROLE: false,
  };
  const rolesToDisable: RoleMap = {
    DEFAULT_ADMIN_ROLE: false,
    SUPPLY_MANAGEMENT_ROLE: false,
    USER_MANAGEMENT_ROLE: false,
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
    const grantResult = await grantRole({
      address,
      roles: rolesToEnable,
      userAddress,
      pincode,
      assettype,
    });
    if (grantResult?.data) {
      txns.push(...grantResult.data);
    }
  }

  const hasRolesToRevoke = Object.keys(rolesToDisable).length > 0;
  if (hasRolesToRevoke) {
    const revokeResult = await revokeRole({
      address,
      roles: rolesToDisable,
      userAddress,
      pincode,
      assettype,
    });

    if (revokeResult?.data) {
      txns.push(...revokeResult.data);
    }
  }

  return safeParse(t.Hashes(), txns);
}

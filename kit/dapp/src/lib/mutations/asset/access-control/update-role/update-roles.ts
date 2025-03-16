import type { Role } from '@/lib/config/roles';
import { action } from '@/lib/mutations/safe-action';
import { safeParseWithLogging, z } from '@/lib/utils/zod';
import {
  type GrantRoleMutation,
  getGrantRoleAction,
} from '../grant-role/grant-role';
import {
  type RevokeRoleMutation,
  getRevokeRoleAction,
} from '../revoke-role/revoke-role';
import { UpdateRolesSchema } from './update-role-schema';

/**
 * Server action for updating a user's roles for a equity
 *
 * @remarks
 * This action combines both granting and revoking roles in a single operation.
 * It processes both operations sequentially and returns an array of transaction hash arrays.
 *
 * @example
 * ```tsx
 * const updateRolesAction = updateRoles.bind(null);
 *
 * // Later in your component
 * try {
 *   await updateRolesAction({
 *     address: "0x123...",
 *     roles: { minter: true, burner: false, pauser: true },
 *     userAddress: "0x456...",
 *     pincode: "123456",
 *   });
 *   toast.success("Roles updated successfully");
 * } catch (error) {
 *   toast.error("Failed to update roles");
 * }
 * ```
 */
export const getUpdateRolesAction = ({
  grantRoleMutation,
  revokeRoleMutation,
}: {
  grantRoleMutation: GrantRoleMutation;
  revokeRoleMutation: RevokeRoleMutation;
}) =>
  action
    .schema(UpdateRolesSchema)
    .outputSchema(z.hashes())
    .action(async ({ parsedInput }) => {
      const { address, roles, userAddress, pincode } = parsedInput;

      // Separate roles to grant and revoke
      const rolesToEnable: Record<string, boolean> = {};
      const rolesToDisable: Record<string, boolean> = {};

      for (const [role, enabled] of Object.entries(roles)) {
        if (enabled) {
          rolesToEnable[role] = true;
        } else {
          rolesToDisable[role] = true;
        }
      }
      const grantRole = getGrantRoleAction(grantRoleMutation);
      const revokeRole = getRevokeRoleAction(revokeRoleMutation);

      const txns: string[] = [];

      const hasRolesToGrant = Object.keys(rolesToEnable).length > 0;
      if (hasRolesToGrant) {
        const grantResult = await grantRole({
          address,
          roles: rolesToEnable as Record<Role, boolean>,
          userAddress,
          pincode,
        });

        if (grantResult?.data) {
          txns.push(...grantResult.data);
        }
      }

      const hasRolesToRevoke = Object.keys(rolesToDisable).length > 0;
      if (hasRolesToRevoke) {
        const revokeResult = await revokeRole({
          address,
          roles: rolesToDisable as Record<Role, boolean>,
          userAddress,
          pincode,
        });

        if (revokeResult?.data) {
          txns.push(...revokeResult.data);
        }
      }

      return safeParseWithLogging(z.hashes(), txns);
    });

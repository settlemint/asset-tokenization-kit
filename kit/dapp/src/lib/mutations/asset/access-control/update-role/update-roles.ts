import type { Role } from '@/lib/config/roles';
import { action } from '@/lib/mutations/safe-action';
import { safeParseWithLogging, z } from '@/lib/utils/zod';
import { grantRole } from '../grant-role/grant-role-action';
import { revokeRole } from '../revoke-role/revoke-role';
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
export const updateRoles = action
  .schema(UpdateRolesSchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: { address, roles, userAddress, pincode, assettype },
    }) => {
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

      const txns: string[] = [];

      const hasRolesToGrant = Object.keys(rolesToEnable).length > 0;
      if (hasRolesToGrant) {
        const grantResult = await grantRole({
          address,
          roles: rolesToEnable as Record<Role, boolean>,
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
          roles: rolesToDisable as Record<Role, boolean>,
          userAddress,
          pincode,
          assettype,
        });

        if (revokeResult?.data) {
          txns.push(...revokeResult.data);
        }
      }

      return safeParseWithLogging(z.hashes(), txns);
    }
  );

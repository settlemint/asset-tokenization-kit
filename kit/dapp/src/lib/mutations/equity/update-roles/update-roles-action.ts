'use server';

import type { Role } from '@/lib/config/roles';
import { z } from '@/lib/utils/zod';
import { action } from '../../safe-action';
import { grantRole } from '../grant-role/grant-role-action';
import { revokeRole } from '../revoke-role/revoke-role-action';
import { UpdateRolesSchema } from './update-roles-schema';

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
  .outputSchema(z.array(z.array(z.hash())))
  .action(async ({ parsedInput }) => {
    const { address, roles, userAddress, pincode } = parsedInput;

    // Separate roles to grant and revoke
    const rolesToEnable: Record<string, boolean> = {};
    const rolesToDisable: Record<string, boolean> = {};

    Object.entries(roles).forEach(([role, enabled]) => {
      if (enabled) {
        rolesToEnable[role] = true;
      } else {
        rolesToDisable[role] = true;
      }
    });

    // Process role grant and revoke operations
    const results: string[][] = [];

    // Handle role granting if there are roles to enable
    if (Object.keys(rolesToEnable).length > 0) {
      try {
        const grantResult = await grantRole({
          address,
          roles: rolesToEnable as Record<Role, boolean>,
          userAddress,
          pincode,
        });

        if (grantResult?.data) {
          results.push(grantResult.data);
        }
      } catch (error) {
        console.error('Error granting roles:', error);
        throw error;
      }
    }

    // Handle role revocations if there are roles to disable
    if (Object.keys(rolesToDisable).length > 0) {
      try {
        const revokeResult = await revokeRole({
          address,
          roles: rolesToDisable as Record<Role, boolean>,
          userAddress,
          pincode,
        });

        if (revokeResult?.data) {
          results.push(revokeResult.data);
        }
      } catch (error) {
        console.error('Error revoking roles:', error);
        throw error;
      }
    }

    return z.array(z.array(z.hash())).parse(results);
  });

'use server';

import { handleChallenge } from '@/lib/challenge';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z } from '@/lib/utils/zod';
import { action } from '../../safe-action';
import { UpdateRolesSchema } from './update-roles-schema';

/**
 * GraphQL mutation to grant a role to an account for an equity
 *
 * @remarks
 * This mutation requires authentication via challenge response
 */
const EquityGrantRole = portalGraphql(`
  mutation EquityGrantRole($address: String!, $from: String!, $challengeResponse: String!, $role: String!, $account: String!) {
    EquityGrantRole(
      address: $address
      from: $from
      input: {role: $role, account: $account}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation to revoke a role from an account for an equity
 *
 * @remarks
 * This mutation requires authentication via challenge response
 */
const EquityRevokeRole = portalGraphql(`
  mutation EquityRevokeRole($address: String!, $from: String!, $challengeResponse: String!, $role: String!, $account: String!) {
    EquityRevokeRole(
      address: $address
      from: $from
      input: {role: $role, account: $account}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * Map of role names to their corresponding byte strings
 */
const ROLES = {
  ADMIN: '0x0000000000000000000000000000000000000000000000000000000000000000',
  SUPPLY_MANAGER:
    '0x7a8dc26796a1e50e6e190b70259f58f6a4edd5b22280ceecc82b687b8e982869',
  USER_MANAGER:
    '0xf5e09b4647c695736f6a1427562c70ff437a315248dd2f8f7ff87e3792a3df6c',
} as const;

/**
 * Server action for updating a user's roles for an equity
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
      parsedInput: { address, roles, account, pincode },
      ctx: { user },
    }) => {
      const transactions: string[] = [];

      // Process each role
      for (const [roleName, shouldHave] of Object.entries(roles)) {
        const roleBytes = ROLES[roleName as keyof typeof ROLES];

        if (!roleBytes) {
          console.warn(`Skipping unknown role: ${roleName}`);
          continue;
        }

        // Grant or revoke the role based on the shouldHave flag
        if (shouldHave) {
          const response = await portalClient.request(EquityGrantRole, {
            address,
            from: user.wallet,
            role: roleBytes,
            account,
            challengeResponse: await handleChallenge(user.wallet, pincode),
          });

          if (response.EquityGrantRole?.transactionHash) {
            transactions.push(response.EquityGrantRole.transactionHash);
          }
        } else {
          const response = await portalClient.request(EquityRevokeRole, {
            address,
            from: user.wallet,
            role: roleBytes,
            account,
            challengeResponse: await handleChallenge(user.wallet, pincode),
          });

          if (response.EquityRevokeRole?.transactionHash) {
            transactions.push(response.EquityRevokeRole.transactionHash);
          }
        }
      }

      return z.hashes().parse(transactions);
    }
  );

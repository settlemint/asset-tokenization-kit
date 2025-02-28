'use server';

import { handleChallenge } from '@/lib/challenge';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z } from '@/lib/utils/zod';
import { action } from '../../safe-action';
import { GrantRoleSchema } from './grant-role-schema';

/**
 * GraphQL mutation to grant a role to an account for a bond
 *
 * @remarks
 * This mutation requires authentication via challenge response
 */
const BondGrantRole = portalGraphql(`
  mutation BondGrantRole($address: String!, $from: String!, $challengeResponse: String!, $role: String!, $account: String!) {
    BondGrantRole(
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

type RoleKey = keyof typeof ROLES;

export const grantRole = action
  .schema(GrantRoleSchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: { address, pincode, role, user },
      ctx: { user: currentUser },
    }) => {
      const roleBytes = ROLES[role as RoleKey];

      if (!roleBytes) {
        throw new Error(`Invalid role: ${role}`);
      }

      const response = await portalClient.request(BondGrantRole, {
        address,
        from: currentUser.wallet,
        role: roleBytes,
        account: user,
        challengeResponse: await handleChallenge(currentUser.wallet, pincode),
      });

      return z.hashes().parse([response.BondGrantRole?.transactionHash]);
    }
  );

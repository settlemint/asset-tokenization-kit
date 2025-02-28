'use server';

import { handleChallenge } from '@/lib/challenge';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z } from '@/lib/utils/zod';
import { action } from '../../safe-action';
import { RevokeRoleSchema } from './revoke-role-schema';

/**
 * GraphQL mutation to revoke a role from an account for a fund
 *
 * @remarks
 * This mutation requires authentication via challenge response
 */
const FundRevokeRole = portalGraphql(`
  mutation FundRevokeRole($address: String!, $from: String!, $challengeResponse: String!, $role: String!, $account: String!) {
    FundRevokeRole(
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
};

export const revokeRole = action
  .schema(RevokeRoleSchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: { address, pincode, role, account },
      ctx: { user },
    }) => {
      const roleBytes = ROLES[role];

      if (!roleBytes) {
        throw new Error(`Invalid role: ${role}`);
      }

      const response = await portalClient.request(FundRevokeRole, {
        address,
        from: user.wallet,
        role: roleBytes,
        account,
        challengeResponse: await handleChallenge(user.wallet, pincode),
      });

      return z.hashes().parse([response.FundRevokeRole?.transactionHash]);
    }
  );

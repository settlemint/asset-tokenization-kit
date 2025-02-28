'use server';

import { handleChallenge } from '@/lib/challenge';
import { getRoleIdentifier, type Role } from '@/lib/config/roles';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z } from '@/lib/utils/zod';
import { action } from '../../safe-action';
import { GrantRoleSchema } from './grant-role-schema';

/**
 * GraphQL mutation for granting a role to a user for a cryptocurrency
 *
 * @remarks
 * Assigns permissions to an account for interacting with the cryptocurrency
 */
const GrantRole = portalGraphql(`
  mutation GrantRole($address: String!, $from: String!, $challengeResponse: String!, $input: CryptoCurrencyGrantRoleInput!) {
    CryptoCurrencyGrantRole(
      from: $from
      input: $input
      address: $address
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const grantRole = action
  .schema(GrantRoleSchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: { address, roles, userAddress, pincode },
      ctx: { user },
    }) => {
      const selectedRoles = Object.entries(roles)
        .filter(([, enabled]) => enabled)
        .map(([role]) => role as Role);

      // Create an array of promises for each role granting request
      const grantPromises = selectedRoles.map(async (role) => {
        const response = await portalClient.request(GrantRole, {
          address: address,
          from: user.wallet,
          input: {
            role: getRoleIdentifier(role),
            account: userAddress,
          },
          challengeResponse: await handleChallenge(user.wallet, pincode),
        });

        return response.CryptoCurrencyGrantRole?.transactionHash;
      });

      // Execute all requests in parallel
      const results = await Promise.all(grantPromises);

      // Filter out any undefined values and return transaction hashes
      const transactions = results.filter(Boolean) as string[];

      return z.hashes().parse(transactions);
    }
  );

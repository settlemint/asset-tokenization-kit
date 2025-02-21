'use server';

import { handleChallenge } from '@/lib/challenge';
import { type Role, getRoleIdentifier } from '@/lib/config/roles';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { Address } from 'viem';
import { RevokeAllFormSchema, RevokeAllOutputSchema } from './schema';

const RevokeRole = portalGraphql(`
  mutation RevokeRole($address: String!, $challengeResponse: String!, $from: String!, $input: StableCoinRevokeRoleInput!) {
    StableCoinRevokeRole(
      from: $from
      input: $input
      address: $address
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const revokeAll = actionClient
  .schema(RevokeAllFormSchema)
  .outputSchema(RevokeAllOutputSchema)
  .action(async ({ parsedInput: { pincode, address, userAddress, currentRoles }, ctx: { user } }) => {
    if (currentRoles.length === 0) {
      return []; // No roles to revoke
    }

    const transactions: string[] = [];

    // Revoke each current role
    for (const role of currentRoles) {
      const { StableCoinRevokeRole } = await portalClient.request(RevokeRole, {
        address,
        from: user.wallet,
        input: {
          role: getRoleIdentifier(role as Role),
          account: userAddress,
        },
        challengeResponse: await handleChallenge(user.wallet as Address, pincode),
      });

      if (!StableCoinRevokeRole?.transactionHash) {
        throw new Error(`Failed to revoke role: ${role}`);
      }
      transactions.push(StableCoinRevokeRole.transactionHash);
    }

    return transactions;
  });

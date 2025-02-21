'use server';
import { handleChallenge } from '@/lib/challenge';
import { type Role, getRoleIdentifier } from '@/lib/config/roles';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { Address } from 'viem';
import { AddTokenAdminFormSchema, AddTokenAdminOutputSchema } from './schema';

const GrantRole = portalGraphql(`
  mutation GrantRole($address: String!, $challengeResponse: String!, $from: String!, $input: StableCoinGrantRoleInput!) {
    StableCoinGrantRole(
      from: $from
      input: $input
      address: $address
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const addTokenAdmin = actionClient
  .schema(AddTokenAdminFormSchema)
  .outputSchema(AddTokenAdminOutputSchema)
  .action(async ({ parsedInput: { roles, address, userAddress, pincode }, ctx: { user } }) => {
    const selectedRoles = Object.entries(roles)
      .filter(([_, enabled]) => enabled)
      .map(([role]) => role as Role);

    const transactions: string[] = [];

    for (const role of selectedRoles) {
      const { StableCoinGrantRole } = await portalClient.request(GrantRole, {
        address,
        from: user.wallet,
        input: {
          role: getRoleIdentifier(role),
          account: userAddress,
        },
        challengeResponse: await handleChallenge(user.wallet as Address, pincode),
      });

      if (!StableCoinGrantRole?.transactionHash) {
        throw new Error(`Failed to grant role: ${role}`);
      }

      transactions.push(StableCoinGrantRole.transactionHash);
    }

    return transactions;
  });

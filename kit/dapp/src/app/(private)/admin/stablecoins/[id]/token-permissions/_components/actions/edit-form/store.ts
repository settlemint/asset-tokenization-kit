'use server';

import { handleChallenge } from '@/lib/challenge';
import { type Role, getRoleIdentifier } from '@/lib/config/roles';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { Address } from 'viem';
import { EditRolesFormSchema, EditRolesOutputSchema } from './schema';

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

export const editRoles = actionClient
  .schema(EditRolesFormSchema)
  .outputSchema(EditRolesOutputSchema)
  .action(async ({ parsedInput: { pincode, address, currentRoles, newRoles, userAddress }, ctx: { user } }) => {
    const newRolesArray = Object.entries(newRoles)
      .filter(([_, enabled]) => enabled)
      .map(([role]) => role as Role);
    const rolesToGrant = newRolesArray.filter((role) => !currentRoles.includes(role));
    const rolesToRevoke = currentRoles.filter((role) => !newRolesArray.includes(role));

    const challengeResponse = await handleChallenge(user.wallet as Address, pincode);
    const transactions: string[] = [];

    // Grant new roles
    for (const role of rolesToGrant) {
      const { StableCoinGrantRole } = await portalClient.request(GrantRole, {
        address,
        from: user.wallet,
        input: {
          role: getRoleIdentifier(role),
          account: userAddress,
        },
        challengeResponse,
      });

      if (!StableCoinGrantRole?.transactionHash) {
        throw new Error(`Failed to grant role: ${role}`);
      }
      transactions.push(StableCoinGrantRole.transactionHash);
    }

    // Revoke removed roles
    for (const role of rolesToRevoke) {
      const { StableCoinRevokeRole } = await portalClient.request(RevokeRole, {
        address,
        from: user.wallet,
        input: {
          role: getRoleIdentifier(role),
          account: userAddress,
        },
        challengeResponse,
      });

      if (!StableCoinRevokeRole?.transactionHash) {
        throw new Error(`Failed to revoke role: ${role}`);
      }
      transactions.push(StableCoinRevokeRole.transactionHash);
    }

    console.log(transactions);

    return transactions;
  });

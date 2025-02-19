'use server';

import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { Address } from 'viem';
import { BlockUserFormSchema, BlockUserOutputSchema } from './schema';

const BlockUser = portalGraphql(`
  mutation BlockUser($address: String!, $challengeResponse: String!, $from: String!, $user: String!) {
    FundBlockUser(
      from: $from
      input: {user: $user}
      address: $address
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

const UnBlockUser = portalGraphql(`
  mutation UnBlockUser($address: String!, $challengeResponse: String!, $from: String!, $user: String!) {
    FundUnblockUser(
      from: $from
      input: {user: $user}
      address: $address
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const blockUser = actionClient
  .schema(BlockUserFormSchema)
  .outputSchema(BlockUserOutputSchema)
  .action(async ({ parsedInput: { pincode, address, blocked, userAddress }, ctx: { user } }) => {
    if (blocked) {
      const { FundBlockUser } = await portalClient.request(BlockUser, {
        address,
        from: user.wallet,
        user: userAddress,
        challengeResponse: await handleChallenge(user.wallet as Address, pincode),
      });
      if (!FundBlockUser?.transactionHash) {
        throw new Error('Failed to send the transaction to block the user');
      }
      return FundBlockUser.transactionHash;
    }

    const { FundUnblockUser } = await portalClient.request(UnBlockUser, {
      address,
      from: user.wallet,
      user: userAddress,
      challengeResponse: await handleChallenge(user.wallet as Address, pincode),
    });
    if (!FundUnblockUser?.transactionHash) {
      throw new Error('Failed to send the transaction to unblock the user');
    }
    return FundUnblockUser.transactionHash;
  });

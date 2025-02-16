'use server';

import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { Address } from 'viem';
import { z } from 'zod';
import { BlockHolderFormSchema, BlockHolderOutputSchema } from './schema';

const BlockHolder = portalGraphql(`
  mutation BlockHolder($address: String!, $from: String!, $challengeResponse: String!, $holder: String!, $gasLimit: String!) {
    FundBlockUser(
      address: $address
      from: $from
      input: {user: $holder}
      challengeResponse: $challengeResponse
      gasLimit: $gasLimit
    ) {
      transactionHash
    }
  }
`);

const UnblockHolder = portalGraphql(`
  mutation UnblockHolder($address: String!, $from: String!, $challengeResponse: String!, $holder: String!, $gasLimit: String!) {
    FundUnblockUser(
      address: $address
      from: $from
      input: {user: $holder}
      challengeResponse: $challengeResponse
      gasLimit: $gasLimit
    ) {
      transactionHash
    }
  }
`);

export const blockHolder = actionClient
  .schema(
    BlockHolderFormSchema.extend({
      address: z.string(),
      holder: z.string(),
      blocked: z.boolean(),
    })
  )
  .outputSchema(BlockHolderOutputSchema)
  .action(async ({ parsedInput: { pincode, address, holder, blocked }, ctx: { user } }) => {
    if (blocked) {
      const { FundUnblockUser } = await portalClient.request(UnblockHolder, {
        address,
        from: user.wallet,
        holder,
        challengeResponse: await handleChallenge(user.wallet as Address, pincode),
        gasLimit: '200000',
      });
      if (!FundUnblockUser?.transactionHash) {
        throw new Error('Failed to send the transaction to unblock the holder');
      }
      return FundUnblockUser.transactionHash;
    }

    const { FundBlockUser } = await portalClient.request(BlockHolder, {
      address,
      from: user.wallet,
      holder,
      challengeResponse: await handleChallenge(user.wallet as Address, pincode),
      gasLimit: '200000',
    });
    if (!FundBlockUser?.transactionHash) {
      throw new Error('Failed to send the transaction to block the holder');
    }
    return FundBlockUser.transactionHash;
  });

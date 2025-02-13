'use server';

import { getAuthenticatedUser } from '@/lib/auth/auth';
import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { Address } from 'viem';
import { z } from 'zod';
import { BlockHolderFormSchema, BlockHolderOutputSchema } from './schema';

const BlockHolder = portalGraphql(`
  mutation BlockHolder($address: String!, $from: String!, $challengeResponse: String!, $input: FundBlockUserInput!) {
    FundBlockUser(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
      input: $input
    ) {
      hash
    }
  }
`);

const UnblockHolder = portalGraphql(`
  mutation UnblockHolder($address: String!, $from: String!, $challengeResponse: String!, $input: FundUnblockUserInput!) {
    FundUnblockUser(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
      input: $input
    ) {
      hash
    }
  }
`);

class InvalidChallengeResponseError extends Error {
  constructor() {
    super('Invalid or expired pincode. Please try again with a new pincode.');
    this.name = 'InvalidChallengeResponseError';
  }
}

export const blockHolder = actionClient
  .schema(
    BlockHolderFormSchema.extend({
      address: z.string(),
      holder: z.string(),
      blocked: z.boolean(),
    })
  )
  .outputSchema(BlockHolderOutputSchema)
  .action(async ({ parsedInput: { pincode, address, holder, blocked } }) => {
    const user = await getAuthenticatedUser();

    try {
      if (blocked) {
        const { FundUnblockUser } = await portalClient.request(UnblockHolder, {
          address,
          from: user.wallet,
          challengeResponse: await handleChallenge(user.wallet as Address, pincode),
          input: {
            account: holder,
          },
        });
        if (!FundUnblockUser?.hash) {
          throw new Error('Failed to send the transaction to unblock the holder');
        }
        return FundUnblockUser.hash;
      }

      const { FundBlockUser } = await portalClient.request(BlockHolder, {
        address,
        from: user.wallet,
        challengeResponse: await handleChallenge(user.wallet as Address, pincode),
        input: {
          account: holder,
        },
      });
      if (!FundBlockUser?.hash) {
        throw new Error('Failed to send the transaction to block the holder');
      }
      return FundBlockUser.hash;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid challenge response')) {
        throw new InvalidChallengeResponseError();
      }
      throw error;
    }
  });

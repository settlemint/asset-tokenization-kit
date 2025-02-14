'use server';
import { actionClient } from '@/lib/safe-action';
import { portalGraphql } from '@/lib/settlemint/portal';
import { z } from 'zod';
import { BlockHolderFormSchema, BlockHolderOutputSchema } from './schema';

const BlockHolder = portalGraphql(`
  mutation BlockHolder(
    $address: String!,
    $from: String!,
    $challengeResponse: String,
    $input: FundBlockUserInput!
  ) {
    FundBlockUser(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
      input: $input
    ) {
      transactionHash
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
      address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
      holder: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
      blocked: z.boolean(),
    })
  )
  .outputSchema(BlockHolderOutputSchema)
  .action(async ({ parsedInput: { pincode, address, holder, blocked } }) => {
    // TODO: add action back in https://linear.app/settlemint/issue/ENG-2357/fund-block-and-unblock-user-user-actions
    return await Promise.resolve('0x0000000000000000000000000000000000000000000000000000000000000000'); // Placeholder transaction hash
    // const user = await getAuthenticatedUser();
    // try {
    //   if (blocked) {
    //     const { FundUnblockUser } = await portalClient.request(UnblockHolder, {
    //       address,
    //       from: user.wallet,
    //       challengeResponse: await handleChallenge(user.wallet as Address, pincode),
    //       input: {
    //         user: holder,
    //       },
    //     });
    //     if (!FundUnblockUser?.transactionHash) {
    //       throw new Error('Failed to send the transaction to unblock the holder');
    //     }
    //     return FundUnblockUser.transactionHash;
    //   }
    //   const { FundBlockUser } = await portalClient.request(BlockHolder, {
    //     address,
    //     from: user.wallet,
    //     challengeResponse: await handleChallenge(user.wallet as Address, pincode),
    //     input: {
    //       user: holder,
    //     },
    //   });
    //   if (!FundBlockUser?.transactionHash) {
    //     throw new Error('Failed to send the transaction to block the holder');
    //   }
    //   return FundBlockUser.transactionHash;
    // } catch (error) {
    //   if (error instanceof Error && error.message.includes('Invalid challenge response')) {
    //     throw new InvalidChallengeResponseError();
    //   }
    //   throw error;
    // }
  });

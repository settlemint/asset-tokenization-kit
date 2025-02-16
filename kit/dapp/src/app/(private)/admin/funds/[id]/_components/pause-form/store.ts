'use server';

import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { Address } from 'viem';
import { PauseFormSchema, PauseOutputSchema } from './schema';

const PauseFund = portalGraphql(`
  mutation PauseFund($address: String!, $from: String!, $challengeResponse: String!) {
    FundPause(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

const UnpauseFund = portalGraphql(`
  mutation UnpauseFund($address: String!, $from: String!, $challengeResponse: String!) {
    FundUnpause(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const pauseFund = actionClient
  .schema(PauseFormSchema)
  .outputSchema(PauseOutputSchema)
  .action(async ({ parsedInput: { pincode, address, paused }, ctx: { user } }) => {
    if (paused) {
      const { FundUnpause } = await portalClient.request(UnpauseFund, {
        address,
        from: user.wallet,
        challengeResponse: await handleChallenge(user.wallet as Address, pincode),
      });
      if (!FundUnpause?.transactionHash) {
        throw new Error('Failed to send the transaction to unpause the fund');
      }
      return FundUnpause.transactionHash;
    }

    const { FundPause } = await portalClient.request(PauseFund, {
      address,
      from: user.wallet,
      challengeResponse: await handleChallenge(user.wallet as Address, pincode),
    });
    if (!FundPause?.transactionHash) {
      throw new Error('Failed to send the transaction to pause the fund');
    }
    return FundPause.transactionHash;
  });

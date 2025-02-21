'use server';

import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { Address } from 'viem';
import { PauseFormSchema, PauseOutputSchema } from './schema';

const PauseStablecoin = portalGraphql(`
  mutation PauseStablecoin($address: String!, $from: String!, $challengeResponse: String!) {
    StableCoinPause(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

const UnpauseStablecoin = portalGraphql(`
  mutation UnpauseStablecoin($address: String!, $from: String!, $challengeResponse: String!) {
    StableCoinUnpause(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const pauseStablecoin = actionClient
  .schema(PauseFormSchema)
  .outputSchema(PauseOutputSchema)
  .action(async ({ parsedInput: { pincode, address, paused }, ctx: { user } }) => {
    if (paused) {
      const { StableCoinUnpause } = await portalClient.request(UnpauseStablecoin, {
        address,
        from: user.wallet,
        challengeResponse: await handleChallenge(user.wallet as Address, pincode),
      });
      if (!StableCoinUnpause?.transactionHash) {
        throw new Error('Failed to send the transaction to unpause the stablecoin');
      }
      return StableCoinUnpause.transactionHash;
    }

    const { StableCoinPause } = await portalClient.request(PauseStablecoin, {
      address,
      from: user.wallet,
      challengeResponse: await handleChallenge(user.wallet as Address, pincode),
    });
    if (!StableCoinPause?.transactionHash) {
      throw new Error('Failed to send the transaction to pause the stablecoin');
    }
    return StableCoinPause.transactionHash;
  });

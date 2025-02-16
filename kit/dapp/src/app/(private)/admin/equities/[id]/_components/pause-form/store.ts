'use server';

import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { Address } from 'viem';
import { PauseFormSchema, PauseOutputSchema } from './schema';

const PauseEquity = portalGraphql(`
  mutation PauseEquity($address: String!, $from: String!, $challengeResponse: String!) {
    EquityPause(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

const UnpauseEquity = portalGraphql(`
  mutation UnpauseEquity($address: String!, $from: String!, $challengeResponse: String!) {
    EquityUnpause(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const pauseEquity = actionClient
  .schema(PauseFormSchema)
  .outputSchema(PauseOutputSchema)
  .action(async ({ parsedInput: { pincode, address, paused }, ctx: { user } }) => {
    if (paused) {
      const { EquityUnpause } = await portalClient.request(UnpauseEquity, {
        address,
        from: user.wallet,
        challengeResponse: await handleChallenge(user.wallet as Address, pincode),
      });
      if (!EquityUnpause?.transactionHash) {
        throw new Error('Failed to send the transaction to unpause the equity');
      }
      return EquityUnpause.transactionHash;
    }

    const { EquityPause } = await portalClient.request(PauseEquity, {
      address,
      from: user.wallet,
      challengeResponse: await handleChallenge(user.wallet as Address, pincode),
    });
    if (!EquityPause?.transactionHash) {
      throw new Error('Failed to send the transaction to pause the equity');
    }
    return EquityPause.transactionHash;
  });

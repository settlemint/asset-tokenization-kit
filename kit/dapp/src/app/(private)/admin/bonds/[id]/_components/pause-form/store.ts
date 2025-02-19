'use server';

import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { Address } from 'viem';
import { PauseFormSchema, PauseOutputSchema } from './schema';

const PauseBond = portalGraphql(`
  mutation PauseBond($address: String!, $from: String!, $challengeResponse: String!) {
    BondPause(
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

export const pauseBond = actionClient
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

    const { BondPause } = await portalClient.request(PauseBond, {
      address,
      from: user.wallet,
      challengeResponse: await handleChallenge(user.wallet as Address, pincode),
    });
    if (!BondPause?.transactionHash) {
      throw new Error('Failed to send the transaction to pause the bond');
    }
    return BondPause.transactionHash;
  });

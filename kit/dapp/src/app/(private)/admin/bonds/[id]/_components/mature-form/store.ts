'use server';
import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { Address } from 'viem';
import { MatureFormSchema, MatureOutputSchema } from './schema';

const MatureBond = portalGraphql(`
  mutation MatureBond(
    $address: String!,
    $from: String!,
    $challengeResponse: String!
  ) {
    BondMature(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const matureBond = actionClient
  .schema(MatureFormSchema)
  .outputSchema(MatureOutputSchema)
  .action(async ({ parsedInput: { address, pincode }, ctx: { user } }) => {
    try {
      const data = await portalClient.request(MatureBond, {
        address: address,
        from: user.wallet,
        challengeResponse: await handleChallenge(user.wallet as Address, pincode),
      });

      const transactionHash = data.BondMature?.transactionHash;
      if (!transactionHash) {
        throw new Error('Failed to send the transaction to mature the bond');
      }

      return transactionHash;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to mature bond: ${errorMessage}`);
    }
  });

'use server';
import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { Address } from 'viem';
import { UpdateCollateralFormSchema, UpdateCollateralOutputSchema } from './schema';

const UpdateCollateral = portalGraphql(`
  mutation UpdateCollateral(
    $address: String!,
    $from: String!,
    $challengeResponse: String!,
    $amount: String!
  ) {
    StableCoinUpdateCollateral(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
      input: {amount: $amount}
      simulate: false
    ) {
      transactionHash
    }
  }
`);

export const updateCollateral = actionClient
  .schema(UpdateCollateralFormSchema)
  .outputSchema(UpdateCollateralOutputSchema)
  .action(async ({ parsedInput: { address, amount, pincode }, ctx: { user } }) => {
    const data = await portalClient.request(UpdateCollateral, {
      address: address,
      from: user.wallet as string,
      amount: amount.toString(),
      challengeResponse: await handleChallenge(user.wallet as Address, pincode),
    });

    const transactionHash = data.StableCoinUpdateCollateral?.transactionHash;
    if (!transactionHash) {
      throw new Error('Failed to send the transaction to update collateral');
    }

    return transactionHash;
  });

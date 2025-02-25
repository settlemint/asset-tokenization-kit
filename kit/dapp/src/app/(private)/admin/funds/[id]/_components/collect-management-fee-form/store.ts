'use server';
import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { Address } from 'viem';
import { CollectManagementFeeOutputSchema, CollectManagementFeeSchema } from './schema';

const CollectManagementFeeMutation = portalGraphql(`
  mutation CollectManagementFee(
    $address: String!,
    $from: String!,
    $challengeResponse: String!,
    $gasLimit: String,
    $gasPrice: String,
    $metadata: JSON,
    $simulate: Boolean,
    $value: String
  ) {
    FundCollectManagementFee(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
      gasLimit: $gasLimit
      gasPrice: $gasPrice
      metadata: $metadata
      simulate: $simulate
      value: $value
    ) {
      transactionHash
    }
  }
`);

export const collectManagementFee = actionClient
  .schema(CollectManagementFeeSchema)
  .outputSchema(CollectManagementFeeOutputSchema)
  .action(async ({ parsedInput: { address, pincode }, ctx: { user } }) => {
    const data = await portalClient.request(CollectManagementFeeMutation, {
      address: address,
      from: user.wallet,
      challengeResponse: await handleChallenge(user.wallet as Address, pincode),
    });

    const transactionHash = data.FundCollectManagementFee?.transactionHash;
    if (!transactionHash) {
      throw new Error('Failed to send the transaction to collect management fee');
    }

    return transactionHash;
  });

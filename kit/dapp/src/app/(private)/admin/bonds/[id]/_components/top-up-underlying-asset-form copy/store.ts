'use server';
import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { waitForTransactions } from '@/lib/wait-for-transaction';
import { type Address, parseUnits } from 'viem';
import { TopUpFormSchema, TopUpOutputSchema } from './schema';

const StableCoinApprove = portalGraphql(`
  mutation StableCoinApprove(
    $address: String!,
    $from: String!,
    $challengeResponse: String!,
    $input: StableCoinApproveInput!
  ) {
    StableCoinApprove(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
      input: $input
    ) {
      transactionHash
    }
  }
`);

const TopUpUnderlyingAsset = portalGraphql(`
  mutation TopUpUnderlyingAsset(
    $address: String!,
    $from: String!,
    $challengeResponse: String!,
    $input: BondTopUpUnderlyingAssetInput!
  ) {
    BondTopUpUnderlyingAsset(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
      input: $input
    ) {
      transactionHash
    }
  }
`);

export const topUpUnderlyingAsset = actionClient
  .schema(TopUpFormSchema)
  .outputSchema(TopUpOutputSchema)
  .action(async ({ parsedInput: { address, amount, decimals, pincode, underlyingAssetAddress }, ctx: { user } }) => {
    try {
      // 1. Approve the bond to spend the underlying asset
      const formattedAmount = parseUnits(amount.toString(), decimals).toString();

      const approvalData = await portalClient.request(StableCoinApprove, {
        address: underlyingAssetAddress,
        from: user.wallet,
        challengeResponse: await handleChallenge(user.wallet as Address, pincode),
        input: {
          spender: address,
          value: formattedAmount,
        },
      });

      const approvalTxHash = approvalData.StableCoinApprove?.transactionHash;
      if (!approvalTxHash) {
        throw new Error('Failed to approve the bond to spend the underlying asset');
      }

      // Wait for the approval transaction to be confirmed
      await waitForTransactions(approvalTxHash);

      // 2. Top up the underlying asset
      const data = await portalClient.request(TopUpUnderlyingAsset, {
        address: address,
        from: user.wallet,
        challengeResponse: await handleChallenge(user.wallet as Address, pincode),
        input: {
          amount: formattedAmount,
        },
      });

      const transactionHash = data.BondTopUpUnderlyingAsset?.transactionHash;
      if (!transactionHash) {
        throw new Error('Failed to send the transaction to top up underlying assets');
      }

      return transactionHash;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to top up underlying assets: ${errorMessage}`);
    }
  });

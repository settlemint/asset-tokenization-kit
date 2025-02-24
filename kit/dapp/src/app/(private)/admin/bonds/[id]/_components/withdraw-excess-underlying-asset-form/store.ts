'use server';
import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { Address } from 'viem';
import { WithdrawFormSchema, WithdrawOutputSchema } from './schema';

const WithdrawExcessUnderlyingAssets = portalGraphql(`
  mutation WithdrawExcessUnderlyingAssets(
    $address: String!,
    $from: String!,
    $challengeResponse: String!,
    $input: BondWithdrawExcessUnderlyingAssetsInput!
  ) {
    BondWithdrawExcessUnderlyingAssets(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
      input: $input
    ) {
      transactionHash
    }
  }
`);

export const withdrawExcessUnderlyingAssets = actionClient
  .schema(WithdrawFormSchema)
  .outputSchema(WithdrawOutputSchema)
  .action(async ({ parsedInput: { address, to, pincode }, ctx: { user } }) => {
    try {
      const data = await portalClient.request(WithdrawExcessUnderlyingAssets, {
        address: address,
        from: user.wallet,
        challengeResponse: await handleChallenge(user.wallet as Address, pincode),
        input: {
          to: to,
        },
      });

      const transactionHash = data.BondWithdrawExcessUnderlyingAssets?.transactionHash;
      if (!transactionHash) {
        throw new Error('Failed to send the transaction to withdraw excess underlying assets');
      }

      return transactionHash;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Check for specific error patterns
      if (
        errorMessage.toLowerCase().includes('no excess') ||
        errorMessage.toLowerCase().includes('insufficient balance') ||
        errorMessage.toLowerCase().includes('amount exceeds balance')
      ) {
        throw new Error('There are no excess underlying assets available to withdraw');
      }

      // Generic error as fallback
      throw new Error(`Failed to withdraw excess underlying assets: ${errorMessage}`);
    }
  });

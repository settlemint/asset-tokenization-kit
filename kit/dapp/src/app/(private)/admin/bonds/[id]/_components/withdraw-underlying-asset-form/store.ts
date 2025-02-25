'use server';
import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { type Address, parseUnits } from 'viem';
import { WithdrawFormSchema, WithdrawOutputSchema } from './schema';

const WithdrawUnderlyingAsset = portalGraphql(`
  mutation WithdrawUnderlyingAsset(
    $address: String!,
    $from: String!,
    $challengeResponse: String!,
    $input: BondWithdrawUnderlyingAssetInput!
  ) {
    BondWithdrawUnderlyingAsset(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
      input: $input
    ) {
      transactionHash
    }
  }
`);

export const withdrawUnderlyingAsset = actionClient
  .schema(WithdrawFormSchema)
  .outputSchema(WithdrawOutputSchema)
  .action(async ({ parsedInput: { address, to, amount, pincode, decimals }, ctx: { user } }) => {
    try {
      const data = await portalClient.request(WithdrawUnderlyingAsset, {
        address: address,
        from: user.wallet,
        challengeResponse: await handleChallenge(user.wallet as Address, pincode),
        input: {
          to: to,
          amount: parseUnits(amount.toString(), decimals).toString(),
        },
      });

      const transactionHash = data.BondWithdrawUnderlyingAsset?.transactionHash;
      if (!transactionHash) {
        throw new Error('Failed to send the transaction to withdraw underlying assets');
      }

      return transactionHash;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Check for specific error patterns
      if (
        errorMessage.toLowerCase().includes('insufficient balance') ||
        errorMessage.toLowerCase().includes('amount exceeds balance')
      ) {
        throw new Error('Insufficient underlying assets available to withdraw');
      }

      // Generic error as fallback
      throw new Error(`Failed to withdraw underlying assets: ${errorMessage}`);
    }
  });

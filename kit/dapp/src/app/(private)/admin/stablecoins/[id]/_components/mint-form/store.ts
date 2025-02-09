'use server';
import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { type Address, parseUnits } from 'viem';
import { MintStablecoinFormSchema, MintStablecoinOutputSchema } from './schema';

const MintStableCoin = portalGraphql(`
  mutation MintStableCoin($address: String!, $from: String!, $challengeResponse: String!, $amount: String!, $to: String!) {
    StableCoinMint(
      address: $address
      from: $from
      input: {amount: $amount, to: $to}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const mintStablecoin = actionClient
  .schema(MintStablecoinFormSchema)
  .outputSchema(MintStablecoinOutputSchema)
  .action(async ({ parsedInput: { address, to, amount, pincode, decimals }, ctx: { user } }) => {
    const data = await portalClient.request(MintStableCoin, {
      address: address,
      from: user.wallet as string,
      to: to,
      amount: parseUnits(amount.toString(), decimals).toString(),
      challengeResponse: await handleChallenge(user.wallet as Address, pincode),
    });

    const transactionHash = data.StableCoinMint?.transactionHash;
    if (!transactionHash) {
      throw new Error('Failed to send the transaction to mint the stablecoin');
    }

    return transactionHash;
  });

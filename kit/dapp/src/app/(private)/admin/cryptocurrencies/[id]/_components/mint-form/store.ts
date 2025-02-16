'use server';
import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { type Address, parseUnits } from 'viem';
import { MintFormSchema, MintOutputSchema } from './schema';

const MintCryptoCurrency = portalGraphql(`
  mutation MintCryptoCurrency($address: String!, $from: String!, $challengeResponse: String!, $amount: String!, $to: String!) {
    CryptoCurrencyMint(
      address: $address
      from: $from
      input: {amount: $amount, to: $to}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const mintCryptoCurrency = actionClient
  .schema(MintFormSchema)
  .outputSchema(MintOutputSchema)
  .action(async ({ parsedInput: { address, to, amount, pincode, decimals }, ctx: { user } }) => {
    const data = await portalClient.request(MintCryptoCurrency, {
      address: address,
      from: user.wallet,
      to: to,
      amount: parseUnits(amount.toString(), decimals).toString(),
      challengeResponse: await handleChallenge(user.wallet as Address, pincode),
    });

    const transactionHash = data.CryptoCurrencyMint?.transactionHash;
    if (!transactionHash) {
      throw new Error('Failed to send the transaction to mint the equity');
    }

    return transactionHash;
  });

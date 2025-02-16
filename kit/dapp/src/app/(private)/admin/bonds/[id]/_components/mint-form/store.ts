'use server';
import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { type Address, parseUnits } from 'viem';
import { MintFormSchema, MintOutputSchema } from './schema';

const MintBond = portalGraphql(`
  mutation MintBond($address: String!, $from: String!, $challengeResponse: String!, $amount: String!, $to: String!) {
    BondMint(
      address: $address
      from: $from
      input: {amount: $amount, to: $to}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const mintEquity = actionClient
  .schema(MintFormSchema)
  .outputSchema(MintOutputSchema)
  .action(async ({ parsedInput: { address, to, amount, pincode, decimals }, ctx: { user } }) => {
    const data = await portalClient.request(MintBond, {
      address: address,
      from: user.wallet,
      to: to,
      amount: parseUnits(amount.toString(), decimals).toString(),
      challengeResponse: await handleChallenge(user.wallet as Address, pincode),
    });

    const transactionHash = data.BondMint?.transactionHash;
    if (!transactionHash) {
      throw new Error('Failed to send the transaction to mint the bond');
    }

    return transactionHash;
  });

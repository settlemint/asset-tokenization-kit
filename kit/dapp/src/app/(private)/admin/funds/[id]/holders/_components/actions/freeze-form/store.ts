'use server';

import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { type Address, parseUnits } from 'viem';
import { FreezeFormSchema, FreezeOutputSchema } from './schema';

const Freeze = portalGraphql(`
  mutation Freeze($address: String = "", $challengeResponse: String = "", $from: String = "", $user: String = "", $amount: String = "") {
    FundFreeze(
      address: $address
      from: $from
      input: {user: $user, amount: $amount}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const freeze = actionClient
  .schema(FreezeFormSchema)
  .outputSchema(FreezeOutputSchema)
  .action(async ({ parsedInput: { pincode, address, userAddress, amount, decimals }, ctx: { user } }) => {
    const { FundFreeze } = await portalClient.request(Freeze, {
      address,
      from: user.wallet,
      user: userAddress,
      amount: parseUnits(amount.toString(), decimals).toString(),
      challengeResponse: await handleChallenge(user.wallet as Address, pincode),
    });
    if (!FundFreeze?.transactionHash) {
      throw new Error('Failed to send the transaction to freeze the user');
    }
    return FundFreeze.transactionHash;
  });

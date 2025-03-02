"use server";

import { handleChallenge } from "@/lib/challenge";
import { getBondDetail } from "@/lib/queries/bond/bond-detail";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { z } from "@/lib/utils/zod";
import { parseUnits } from "viem";
import { action } from "../../safe-action";
import { FreezeSchema } from "./freeze-schema";

/**
 * GraphQL mutation to freeze a specific user account from a bond
 */
const BondFreeze = portalGraphql(`
  mutation BondFreeze($address: String!, $challengeResponse: String!, $from: String!, $user: String!, $amount: String!) {
    BondFreeze(
      address: $address
      from: $from
      input: {user: $user, amount: $amount}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const freeze = action
  .schema(FreezeSchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: { address, pincode, userAddress, amount },
      ctx: { user },
    }) => {
      const { decimals } = await getBondDetail({ address });

      const response = await portalClient.request(BondFreeze, {
        address: address,
        user: userAddress,
        from: user.wallet,
        amount: parseUnits(amount.toString(), decimals).toString(),
        challengeResponse: await handleChallenge(user.wallet, pincode),
      });

      return z.hashes().parse([response.BondFreeze?.transactionHash]);
    }
  );

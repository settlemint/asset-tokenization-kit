"use server";

import { handleChallenge } from "@/lib/challenge";
import { getStableCoinDetail } from "@/lib/queries/stablecoin/stablecoin-detail";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { z } from "@/lib/utils/zod";
import { parseUnits } from "viem";
import { action } from "../../safe-action";
import { FreezeSchema } from "./freeze-schema";

/**
 * GraphQL mutation to freeze a specific user account from a stablecoin
 */
const StableCoinFreeze = portalGraphql(`
  mutation StableCoinFreeze($address: String!, $challengeResponse: String!, $from: String!, $user: String!, $amount: String!) {
    StableCoinFreeze(
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
      const { decimals } = await getStableCoinDetail({ address });

      const response = await portalClient.request(StableCoinFreeze, {
        address: address,
        user: userAddress,
        from: user.wallet,
        amount: parseUnits(amount.toString(), decimals).toString(),
        challengeResponse: await handleChallenge(user.wallet, pincode),
      });

      return z.hashes().parse([response.StableCoinFreeze?.transactionHash]);
    }
  );

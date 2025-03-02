"use server";

import { handleChallenge } from "@/lib/challenge";
import { getStableCoinDetail } from "@/lib/queries/stablecoin/stablecoin-detail";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { z } from "@/lib/utils/zod";
import { parseUnits } from "viem";
import { action } from "../../safe-action";
import { UpdateCollateralSchema } from "./update-collateral-schema";

/**
 * GraphQL mutation for updating a stablecoin's collateral amount
 *
 * @remarks
 * Updates the amount of backing collateral for a stablecoin
 */
const StableCoinUpdateCollateral = portalGraphql(`
  mutation StableCoinUpdateCollateral($address: String!, $from: String!, $challengeResponse: String!, $amount: String!) {
    StableCoinUpdateCollateral(
      address: $address
      from: $from
      input: {amount: $amount}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const updateCollateral = action
  .schema(UpdateCollateralSchema)
  .outputSchema(z.hashes())
  .action(
    async ({ parsedInput: { address, pincode, amount }, ctx: { user } }) => {
      const { decimals } = await getStableCoinDetail({ address });

      const response = await portalClient.request(StableCoinUpdateCollateral, {
        address: address,
        from: user.wallet,
        amount: parseUnits(amount.toString(), decimals).toString(),
        challengeResponse: await handleChallenge(user.wallet, pincode),
      });

      return z
        .hashes()
        .parse([response.StableCoinUpdateCollateral?.transactionHash]);
    }
  );

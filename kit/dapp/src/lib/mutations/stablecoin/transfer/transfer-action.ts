"use server";

import { handleChallenge } from "@/lib/challenge";
import { getStableCoinDetail } from "@/lib/queries/stablecoin/stablecoin-detail";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { z } from "@/lib/utils/zod";
import { parseUnits } from "viem";
import { action } from "../../safe-action";
import { TransferStableCoinSchema } from "./transfer-schema";

/**
 * GraphQL mutation to transfer stablecoin tokens
 *
 * @remarks
 * This mutation requires authentication via challenge response
 */
const StableCoinTransfer = portalGraphql(`
  mutation StableCoinTransfer($address: String!, $from: String!, $challengeResponse: String!, $value: String!, $to: String!) {
    Transfer: StableCoinTransfer(
      address: $address
      from: $from
      input: { to: $to, value: $value }
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const transfer = action
  .schema(TransferStableCoinSchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: { address, pincode, value, to },
      ctx: { user },
    }) => {
      const { decimals } = await getStableCoinDetail({ address });

      const response = await portalClient.request(StableCoinTransfer, {
        address,
        from: user.wallet,
        value: parseUnits(value.toString(), decimals).toString(),
        to,
        challengeResponse: await handleChallenge(user.wallet, pincode),
      });

      return z.hashes().parse([response.Transfer?.transactionHash]);
    }
  );

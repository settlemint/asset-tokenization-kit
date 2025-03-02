"use server";

import { handleChallenge } from "@/lib/challenge";
import { getEquityDetail } from "@/lib/queries/equity/equity-detail";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { z } from "@/lib/utils/zod";
import { parseUnits } from "viem";
import { action } from "../../safe-action";
import { BurnSchema } from "./burn-schema";

/**
 * GraphQL mutation for burning equity tokens
 *
 * @remarks
 * Reduces the total supply of the equity by removing tokens from circulation
 */
const EquityBurn = portalGraphql(`
  mutation EquityBurn($address: String!, $from: String!, $challengeResponse: String!, $amount: String!) {
    EquityBurn(
      address: $address
      from: $from
      input: {value: $amount}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const burn = action
  .schema(BurnSchema)
  .outputSchema(z.hashes())
  .action(
    async ({ parsedInput: { address, pincode, amount }, ctx: { user } }) => {
      const { decimals } = await getEquityDetail({ address });

      const response = await portalClient.request(EquityBurn, {
        address: address,
        from: user.wallet,
        amount: parseUnits(amount.toString(), decimals).toString(),
        challengeResponse: await handleChallenge(user.wallet, pincode),
      });

      return z.hashes().parse([response.EquityBurn?.transactionHash]);
    }
  );

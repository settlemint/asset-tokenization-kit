"use server";

import { handleChallenge } from "@/lib/challenge";
import { getBondDetail } from "@/lib/queries/bond/bond-detail";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { z } from "@/lib/utils/zod";
import { parseUnits } from "viem";
import { action } from "../../safe-action";
import { MintSchema } from "./mint-schema";

/**
 * GraphQL mutation to mint new bond tokens
 *
 * @remarks
 * This mutation requires authentication via challenge response
 */
const BondMint = portalGraphql(`
  mutation BondMint($address: String!, $from: String!, $challengeResponse: String!, $amount: String!, $to: String!) {
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

export const mint = action
  .schema(MintSchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: { address, pincode, amount, to },
      ctx: { user },
    }) => {
      const { decimals } = await getBondDetail({ address });

      const response = await portalClient.request(BondMint, {
        address: address,
        from: user.wallet,
        amount: parseUnits(amount.toString(), decimals).toString(),
        to,
        challengeResponse: await handleChallenge(user.wallet, pincode),
      });

      return z.hashes().parse([response.BondMint?.transactionHash]);
    }
  );

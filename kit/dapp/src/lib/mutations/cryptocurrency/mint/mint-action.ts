"use server";

import { handleChallenge } from "@/lib/challenge";
import { getCryptoCurrencyDetail } from "@/lib/queries/cryptocurrency/cryptocurrency-detail";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { z } from "@/lib/utils/zod";
import { parseUnits } from "viem";
import { action } from "../../safe-action";
import { MintSchema } from "./mint-schema";

/**
 * GraphQL mutation to mint new cryptocurrency tokens
 *
 * @remarks
 * This mutation requires authentication via challenge response
 */
const CryptoCurrencyMint = portalGraphql(`
  mutation CryptoCurrencyMint($address: String!, $from: String!, $challengeResponse: String!, $amount: String!, $to: String!) {
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

export const mint = action
  .schema(MintSchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: { address, pincode, amount, to },
      ctx: { user },
    }) => {
      const { decimals } = await getCryptoCurrencyDetail({ address });

      const response = await portalClient.request(CryptoCurrencyMint, {
        address: address,
        from: user.wallet,
        amount: parseUnits(amount.toString(), decimals).toString(),
        to,
        challengeResponse: await handleChallenge(user.wallet, pincode),
      });

      return z.hashes().parse([response.CryptoCurrencyMint?.transactionHash]);
    }
  );

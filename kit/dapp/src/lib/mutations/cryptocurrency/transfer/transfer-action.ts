"use server";

import { handleChallenge } from "@/lib/challenge";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { z } from "@/lib/utils/zod";
import { parseUnits } from "viem";
import { action } from "../../safe-action";
import { TransferCryptoCurrencySchema } from "./transfer-schema";

/**
 * GraphQL mutation to transfer cryptocurrency tokens
 *
 * @remarks
 * This mutation requires authentication via challenge response
 */
const TransferCryptoCurrency = portalGraphql(`
  mutation TransferCryptoCurrency($address: String!, $from: String!, $challengeResponse: String!, $value: String!, $to: String!) {
    Transfer: CryptoCurrencyTransfer(
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
  .schema(TransferCryptoCurrencySchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: { address, pincode, value, to, decimals },
      ctx: { user },
    }) => {
      const response = await portalClient.request(TransferCryptoCurrency, {
        address,
        from: user.wallet,
        value: parseUnits(value.toString(), decimals).toString(),
        to,
        challengeResponse: await handleChallenge(user.wallet, pincode),
      });

      return z.hashes().parse([response.Transfer?.transactionHash]);
    }
  );

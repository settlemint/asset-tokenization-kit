"use server";

import { handleChallenge } from "@/lib/challenge";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { z } from "@/lib/utils/zod";
import { parseUnits } from "viem";
import { action } from "../../safe-action";
import { TransferEquitySchema } from "./transfer-schema";

export const TransferEquity = portalGraphql(`
  mutation TransferEquity($address: String!, $from: String!, $challengeResponse: String!, $value: String!, $to: String!) {
    Transfer: EquityTransfer(
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
  .schema(TransferEquitySchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: { address, to, value, pincode, decimals },
      ctx: { user },
    }) => {
      const response = await portalClient.request(TransferEquity, {
        address: address,
        from: user.wallet,
        to: to,
        value: parseUnits(value.toString(), decimals).toString(),
        challengeResponse: await handleChallenge(user.wallet, pincode),
      });

      return z.hashes().parse([response.Transfer?.transactionHash]);
    }
  );

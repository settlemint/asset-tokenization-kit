"use server";

import { handleChallenge } from "@/lib/challenge";
import { getEquityDetail } from "@/lib/queries/equity/equity-detail";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { z } from "@/lib/utils/zod";
import { parseUnits } from "viem";
import { action } from "../../safe-action";
import { TransferEquitySchema } from "./transfer-schema";

/**
 * GraphQL mutation to transfer equity tokens
 *
 * @remarks
 * This mutation requires authentication via challenge response
 */
const EquityTransfer = portalGraphql(`
  mutation EquityTransfer($address: String!, $from: String!, $challengeResponse: String!, $value: String!, $to: String!) {
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
      parsedInput: { address, pincode, value, to },
      ctx: { user },
    }) => {
      const { decimals } = await getEquityDetail({ address });

      const response = await portalClient.request(EquityTransfer, {
        address,
        from: user.wallet,
        value: parseUnits(value.toString(), decimals).toString(),
        to,
        challengeResponse: await handleChallenge(user.wallet, pincode),
      });

      return z.hashes().parse([response.Transfer?.transactionHash]);
    }
  );

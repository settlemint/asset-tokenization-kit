"use server";

import { handleChallenge } from "@/lib/challenge";
import { getBondDetail } from "@/lib/queries/bond/bond-detail";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { z } from "@/lib/utils/zod";
import { parseUnits } from "viem";
import { action } from "../../safe-action";
import { TransferBondSchema } from "./transfer-schema";

/**
 * GraphQL mutation to transfer bond tokens
 *
 * @remarks
 * This mutation requires authentication via challenge response
 */
const BondTransfer = portalGraphql(`
  mutation BondTransfer($address: String!, $from: String!, $challengeResponse: String!, $value: String!, $to: String!) {
    Transfer: BondTransfer(
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
  .schema(TransferBondSchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: { address, pincode, value, to },
      ctx: { user },
    }) => {
      const { decimals } = await getBondDetail({ address });

      const response = await portalClient.request(BondTransfer, {
        address,
        from: user.wallet,
        value: parseUnits(value.toString(), decimals).toString(),
        to,
        challengeResponse: await handleChallenge(user.wallet, pincode),
      });

      return z.hashes().parse([response.Transfer?.transactionHash]);
    }
  );

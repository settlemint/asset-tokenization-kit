"use server";

import { handleChallenge } from "@/lib/challenge";
import { getBondDetail } from "@/lib/queries/bond/bond-detail";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import { parseUnits } from "viem";
import { action } from "../../safe-action";
import { RedeemBondSchema } from "./redeem-schema";

const BondRedeem = portalGraphql(`
  mutation BondRedeem($address: String!, $from: String!, $challengeResponse: String!, $input: BondRedeemInput!) {
    BondRedeem(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
      input: $input
    ) {
      transactionHash
    }
  }
  `);

export const redeem = action
  .schema(RedeemBondSchema())
  .outputSchema(t.Hashes())
  .action(
    async ({ parsedInput: { address, pincode, amount }, ctx: { user } }) => {
      const { decimals } = await getBondDetail({ address });

      const response = await portalClient.request(BondRedeem, {
        address,
        from: user.wallet,
        input: {
          amount: parseUnits(amount.toString(), decimals).toString(),
        },
        challengeResponse: await handleChallenge(user.wallet, pincode),
      });

      return safeParse(t.Hashes(), [response.BondRedeem?.transactionHash]);
    }
  );

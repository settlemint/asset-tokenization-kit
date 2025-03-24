import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { getBondDetail } from "@/lib/queries/bond/bond-detail";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import { parseUnits } from "viem";
import type { RedeemBondInput } from "./redeem-schema";

/**
 * GraphQL mutation for redeeming a bond
 *
 * @remarks
 * This mutation requires authentication via challenge response
 */
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

/**
 * Function to redeem a bond
 *
 * @param input - Validated input for redeeming the bond
 * @param user - The user initiating the redeem operation
 * @returns The transaction hash
 */
export async function redeemFunction({
  parsedInput: { address, pincode, amount },
  ctx: { user },
}: {
  parsedInput: RedeemBondInput;
  ctx: { user: User };
}) {
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

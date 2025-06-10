import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { getBondDetail } from "@/lib/queries/bond/bond-detail";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import { parseUnits } from "viem";
import type { RedeemBondInput } from "./redeem-schema";

/**
 * GraphQL mutation for redeeming a bond
 *
 * @remarks
 * This mutation requires authentication via challenge response
 */
// const BondRedeem = portalGraphql(`
//   mutation BondRedeem($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: BondRedeemInput!) {
//     BondRedeem(
//       challengeResponse: $challengeResponse
//       verificationId: $verificationId
//       from: $from
//       input: $input
//       address: $address
//     ) {
//       transactionHash
//     }
//   }
// `);

/**
 * Function to redeem a bond
 *
 * @param input - Validated input for redeeming the bond
 * @param user - The user initiating the redeem operation
 * @returns The transaction hash
 */
export const redeemFunction = withAccessControl(
  {
    requiredPermissions: {
      asset: ["manage"],
    },
  },
  async ({
    parsedInput: { address, verificationCode, verificationType, amount },
    ctx: { user },
  }: {
    parsedInput: RedeemBondInput;
    ctx: { user: User };
  }) => {
    const { decimals } = await getBondDetail({
      address,
      userCurrency: user.currency,
    });

      // const response = await portalClient.request(BondRedeem, {
  //       address,
  //       from: user.wallet,
  //       input: {
  //         amount: parseUnits(amount.toString(), decimals).toString(),
  //       },
  //       ...(await handleChallenge(
  //         user,
  //         user.wallet,
  //         verificationCode,
  //         verificationType
  //       )),
  //     });

    return waitForIndexingTransactions(
      safeParse(t.Hashes(), ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92"] // ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.BondRedeem?.transactionHash */])
    );
  }
);

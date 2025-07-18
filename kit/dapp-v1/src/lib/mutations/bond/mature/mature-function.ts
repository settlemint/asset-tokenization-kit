import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import type { MatureFormInput } from "./mature-schema";

// Dummy types for commented GraphQL operations
const MatureBond = {} as any;

/**
 * GraphQL mutation for maturing a bond
 *
 * @remarks
 * This mutation requires authentication via challenge response
 */
// const MatureBond = portalGraphql(`
//   mutation MatureBond(
//     $challengeResponse: String!,
//     $verificationId: String
//     $address: String!,
//     $from: String!,
//   ) {
//     BondMature(
//       challengeResponse: $challengeResponse
//       verificationId: $verificationId
//       address: $address
//       from: $from
//     ) {
//       transactionHash
//     }
//   }
// `);

/**
 * Function to mature a bond
 *
 * @param input - Validated input for maturing the bond
 * @param user - The user initiating the mature operation
 * @returns The transaction hash
 */
export const matureFunction = withAccessControl(
  {
    requiredPermissions: {
      asset: ["manage"],
    },
  },
  async ({
    parsedInput: { address, verificationCode, verificationType },
    ctx: { user },
  }: {
    parsedInput: MatureFormInput;
    ctx: { user: User };
  }) => {
    // const response = await portalClient.request(MatureBond, {
    //       address: address,
    //       from: user.wallet,
    //       ...(await handleChallenge(
    //         user,
    //         user.wallet,
    //         verificationCode,
    //         verificationType
    //       )),
    //     });

    return waitForIndexingTransactions(
      safeParse(t.Hashes(), [
        "0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92",
      ]) // ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.BondMature?.transactionHash */]
    );
  }
);

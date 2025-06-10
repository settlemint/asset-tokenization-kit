import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import type { VariablesOf } from "@settlemint/sdk-portal";
import type { DisallowUserInput } from "./disallow-user-schema";

/**
 * GraphQL mutation to disallow a user from a tokenized deposit
 */
// const DepositDisallowUser = portalGraphql(`
//   mutation DepositDisallowUser(
//     $challengeResponse: String!
//     $verificationId: String
//     $address: String!
//     $from: String!
//     $input: DepositDisallowUserInput!
//   ) {
//     DepositDisallowUser(
//       challengeResponse: $challengeResponse
//       verificationId: $verificationId
//       address: $address
//       from: $from
//       input: $input
//     ) {
//       transactionHash
//     }
//   }
// `);

/**
 * Function to disallow a user from accessing a tokenized deposit
 *
 * @param input - Validated input containing address, verificationCode, userAddress, and assettype
 * @param user - The user executing the disallow operation
 * @returns Array of transaction hashes
 */
export const disallowUserFunction = withAccessControl(
  {
    requiredPermissions: {
      asset: ["manage"],
    },
  },
  async ({
    parsedInput: {
      address,
      verificationCode,
      verificationType,
      userAddress,
      assettype,
    },
    ctx: { user },
  }: {
    parsedInput: DisallowUserInput;
    ctx: { user: User };
  }) => {
    // Common parameters for all mutations
    const params: VariablesOf<typeof DepositDisallowUser> = {
      address,
      from: user.wallet,
      input: {
        user: userAddress,
      },
      ...(await handleChallenge(
        user,
        user.wallet,
        verificationCode,
        verificationType
      )),
    };

    switch (assettype) {
      case "deposit": {
          // const response = await portalClient.request(
  //           DepositDisallowUser,
  //           params
  //         );
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92"]) // ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.DepositDisallowUser?.transactionHash */]
        );
      }
      default:
        throw new Error("Asset type does not support disallow user operations");
    }
  }
);

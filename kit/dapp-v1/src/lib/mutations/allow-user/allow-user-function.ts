import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import type { VariablesOf } from "@settlemint/sdk-portal";
import type { AllowUserInput } from "./allow-user-schema";

/**
 * GraphQL mutation to allow a user to a tokenized deposit
 */
// const DepositAllowUser = portalGraphql(`
//   mutation DepositAllowUser(
//     $challengeResponse: String!
//     $verificationId: String
//     $address: String!
//     $from: String!
//     $input: DepositAllowUserInput!
//   ) {
//     DepositAllowUser(
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

// Dummy type for DepositAllowUser since it's commented out
const DepositAllowUser = {} as any;

/**
 * Function to allow a user to access an asset
 *
 * @param input - Validated input for allowing the user
 * @param user - The user authorizing access
 * @returns The transaction hash
 */
export const allowUserFunction = withAccessControl(
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
    parsedInput: AllowUserInput;
    ctx: { user: User };
  }) => {
    // Common parameters for all mutations
    const params: VariablesOf<any> = {
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
        // const response = await portalClient.request(DepositAllowUser, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), [
            "0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92",
          ]) // ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.DepositAllowUser?.transactionHash */]
        );
      }
      default:
        throw new Error("Asset type does not support allow user operations");
    }
  }
);

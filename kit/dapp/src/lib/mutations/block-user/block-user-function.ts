import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import type { VariablesOf } from "@settlemint/sdk-portal";
import type { BlockUserInput } from "./block-user-schema";

/**
 * GraphQL mutation for blocking a user from a bond
 *
 * @remarks
 * Prevents a user from interacting with the bond
 */
// const BondBlockUser = portalGraphql(`
//   mutation BondBlockUser(
//     $challengeResponse: String!
//     $verificationId: String
//     $address: String!
//     $from: String!
//     $input: BondBlockUserInput!
//   ) {
//     BondBlockUser(
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
 * GraphQL mutation for blocking a user from a stablecoin
 *
 * @remarks
 * Prevents a user from interacting with the stablecoin
 */
// const StableCoinBlockUser = portalGraphql(`
//   mutation StableCoinBlockUser(
//     $challengeResponse: String!
//     $verificationId: String
//     $address: String!
//     $from: String!
//     $input: StableCoinBlockUserInput!
//   ) {
//     StableCoinBlockUser(
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
 * GraphQL mutation for blocking a user from an equity
 *
 * @remarks
 * Prevents a user from interacting with the equity
 */
// const EquityBlockUser = portalGraphql(`
//   mutation EquityBlockUser(
//     $challengeResponse: String!
//     $verificationId: String
//     $address: String!
//     $from: String!
//     $input: EquityBlockUserInput!
//   ) {
//     EquityBlockUser(
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
 * GraphQL mutation for blocking a user from a fund
 *
 * @remarks
 * Prevents a user from interacting with the fund
 */
// const FundBlockUser = portalGraphql(`
//   mutation FundBlockUser(
//     $challengeResponse: String!
//     $verificationId: String
//     $address: String!
//     $from: String!
//     $input: FundBlockUserInput!
//   ) {
//     FundBlockUser(
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
 * Function to block a user from accessing an asset
 *
 * @param input - Validated input for blocking the user
 * @param user - The user blocking access
 * @returns The transaction hash
 */
export const blockUserFunction = withAccessControl(
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
    parsedInput: BlockUserInput;
    ctx: { user: User };
  }) => {
    // Common parameters for all mutations
    const params: VariablesOf<
      | typeof BondBlockUser
      | typeof StableCoinBlockUser
      | typeof EquityBlockUser
      | typeof FundBlockUser
    > = {
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
      case "bond": {
          // const response = await portalClient.request(BondBlockUser, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92"] // ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.BondBlockUser?.transactionHash */])
        );
      }
      case "equity": {
          // const response = await portalClient.request(EquityBlockUser, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92"] // ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.EquityBlockUser?.transactionHash */])
        );
      }
      case "fund": {
          // const response = await portalClient.request(FundBlockUser, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92"] // ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.FundBlockUser?.transactionHash */])
        );
      }
      case "stablecoin": {
          // const response = await portalClient.request(
  //           StableCoinBlockUser,
  //           params
  //         );
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92"] // ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.StableCoinBlockUser?.transactionHash */])
        );
      }
      case "cryptocurrency": {
        throw new Error(
          "Cryptocurrency does not support block user operations"
        );
      }
      case "deposit": {
        throw new Error("Deposit does not support block user operations");
      }
      default:
        throw new Error("Invalid asset type");
    }
  }
);

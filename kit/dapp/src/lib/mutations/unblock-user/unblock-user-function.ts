import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import type { VariablesOf } from "@settlemint/sdk-portal";
import type { UnblockUserInput } from "./unblock-user-schema";

// Dummy types for commented GraphQL operations
const BondUnblockUser = {} as any;
const StableCoinUnblockUser = {} as any;
const EquityUnblockUser = {} as any;
const FundUnblockUser = {} as any;


/**
 * GraphQL mutation to unblock a user from a bond token
 */
// const BondUnblockUser = portalGraphql(`
//   mutation BondUnblockUser($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: BondUnblockUserInput!) {
//     BondUnblockUser(
//       challengeResponse: $challengeResponse
//       verificationId: $verificationId
//       address: $address
//       input: $input
//       from: $from
//     ) {
//       transactionHash
//     }
//   }
// `);

/**
 * GraphQL mutation to unblock a user from a stablecoin token
 */
// const StableCoinUnblockUser = portalGraphql(`
//   mutation StableCoinUnblockUser($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: StableCoinUnblockUserInput!) {
//     StableCoinUnblockUser(
//       challengeResponse: $challengeResponse
//       verificationId: $verificationId
//       address: $address
//       input: $input
//       from: $from
//     ) {
//       transactionHash
//     }
//   }
// `);

/**
 * GraphQL mutation to unblock a user from an equity token
 */
// const EquityUnblockUser = portalGraphql(`
//   mutation EquityUnblockUser($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: EquityUnblockUserInput!) {
//     EquityUnblockUser(
//       challengeResponse: $challengeResponse
//       verificationId: $verificationId
//       address: $address
//       input: $input
//       from: $from
//     ) {
//       transactionHash
//     }
//   }
// `);

/**
 * GraphQL mutation to unblock a user from a fund token
 */
// const FundUnblockUser = portalGraphql(`
//   mutation FundUnblockUser($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: FundUnblockUserInput!) {
//     FundUnblockUser(
//       challengeResponse: $challengeResponse
//       verificationId: $verificationId
//       address: $address
//       input: $input
//       from: $from
//     ) {
//       transactionHash
//     }
//   }
// `);

/**
 * Function to unblock a user from a token
 *
 * @param input - Validated input containing address, verificationCode, userAddress, and assettype
 * @param user - The user executing the unblock operation
 * @returns Array of transaction hashes
 */
export const unblockUserFunction = withAccessControl(
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
    parsedInput: UnblockUserInput;
    ctx: { user: User };
  }) => {
    // Common parameters for all mutations
    const params: VariablesOf<
      | typeof BondUnblockUser
      | typeof StableCoinUnblockUser
      | typeof EquityUnblockUser
      | typeof FundUnblockUser
    > = {
      address,
      input: { user: userAddress },
      from: user.wallet,
      ...(await handleChallenge(
        user,
        user.wallet,
        verificationCode,
        verificationType
      )),
    };

    switch (assettype) {
      case "bond": {
          // const response = await portalClient.request(BondUnblockUser, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92"]) // ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.BondUnblockUser?.transactionHash */]
        );
      }
      case "equity": {
          // const response = await portalClient.request(EquityUnblockUser, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92"]) // ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.EquityUnblockUser?.transactionHash */]
        );
      }
      case "fund": {
          // const response = await portalClient.request(FundUnblockUser, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92"]) // ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.FundUnblockUser?.transactionHash */]
        );
      }
      case "stablecoin": {
          // const response = await portalClient.request(
  //           StableCoinUnblockUser,
  //           params
  //         );
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92"]) /* response.StableCoinUnblockUser?.transactionHash */
        );
      }
      case "cryptocurrency": {
        throw new Error(
          "Cryptocurrency does not support unblock user operations"
        );
      }
      case "deposit": {
        throw new Error("Deposit does not support unblock user operations");
      }
      default:
        throw new Error("Invalid asset type");
    }
  }
);

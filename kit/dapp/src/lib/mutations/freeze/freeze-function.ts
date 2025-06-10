import type { User } from "@/lib/auth/types";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import type { FreezeInput } from "./freeze-schema";

// Dummy types for commented GraphQL operations
const BondFreeze = {} as any;
const EquityFreeze = {} as any;
const FundFreeze = {} as any;
const StableCoinFreeze = {} as any;
const DepositFreeze = {} as any;

/**
 * GraphQL mutation to freeze a specific user account from a bond
 */
// const BondFreeze = portalGraphql(`
//   mutation BondFreeze(
//     $challengeResponse: String!
//     $verificationId: String
//     $address: String!
//     $from: String!
//     $input: BondFreezeInput!
//   ) {
//     BondFreeze(
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
 * GraphQL mutation to freeze a specific user account from an equity
 */
// const EquityFreeze = portalGraphql(`
//   mutation EquityFreeze(
//     $challengeResponse: String!
//     $verificationId: String
//     $address: String!
//     $from: String!
//     $input: EquityFreezeInput!
//   ) {
//     EquityFreeze(
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
 * GraphQL mutation to freeze a specific user account from a fund
 */
// const FundFreeze = portalGraphql(`
//   mutation FundFreeze(
//     $challengeResponse: String!
//     $verificationId: String
//     $address: String!
//     $from: String!
//     $input: FundFreezeInput!
//   ) {
//     FundFreeze(
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
 * GraphQL mutation to freeze a specific user account from a stablecoin
 */
// const StableCoinFreeze = portalGraphql(`
//   mutation StableCoinFreeze(
//     $challengeResponse: String!
//     $verificationId: String
//     $address: String!
//     $from: String!
//     $input: StableCoinFreezeInput!
//   ) {
//     StableCoinFreeze(
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
 * GraphQL mutation to freeze a specific user account from a tokenized deposit
 */
// const DepositFreeze = portalGraphql(`
//   mutation DepositFreeze(
//     $challengeResponse: String!
//     $verificationId: String
//     $address: String!
//     $from: String!
//     $input: DepositFreezeInput!
//   ) {
//     DepositFreeze(
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
 * Function to freeze a specific amount of tokens for a user
 *
 * @param input - Validated input containing address, verificationCode, userAddress, amount, and assettype
 * @param user - The user executing the freeze operation
 * @returns Array of transaction hashes
 */
export const freezeFunction = withAccessControl(
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
      amount,
      assettype,
    },
    ctx: { user },
  }: {
    parsedInput: FreezeInput;
    ctx: { user: User };
  }) => {
    // Get token details based on asset type
    // const { decimals } = await getAssetDetail({
    //   address,
    //   assettype,
    // });

    // // Common parameters for all mutations
    // const params: VariablesOf<
    //   | typeof BondFreeze
    //   | typeof EquityFreeze
    //   | typeof FundFreeze
    //   | typeof StableCoinFreeze
    //   | typeof DepositFreeze
    // > = {
    //   address,
    //   from: user.wallet,
    //   input: {
    //     user: userAddress,
    //     amount: parseUnits(amount.toString(), decimals).toString(),
    //   },
    //   ...(await handleChallenge(
    //     user,
    //     user.wallet,
    //     verificationCode,
    //     verificationType
    //   )),
    // };

    switch (assettype) {
      case "bond": {
        // const response = await portalClient.request(BondFreeze, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), [
            "0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92",
          ]) // ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.BondFreeze?.transactionHash */]
        );
      }
      case "cryptocurrency": {
        throw new Error("Cryptocurrency does not support freeze operations");
      }
      case "equity": {
        // const response = await portalClient.request(EquityFreeze, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), [
            "0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92",
          ]) // ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.EquityFreeze?.transactionHash */]
        );
      }
      case "fund": {
        // const response = await portalClient.request(FundFreeze, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), [
            "0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92",
          ]) // ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.FundFreeze?.transactionHash */]
        );
      }
      case "stablecoin": {
        // const response = await portalClient.request(StableCoinFreeze, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), [
            "0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92",
          ]) // ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.StableCoinFreeze?.transactionHash */]
        );
      }
      case "deposit": {
        // const response = await portalClient.request(DepositFreeze, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), [
            "0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92",
          ]) // ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.DepositFreeze?.transactionHash */]
        );
      }
      default:
        throw new Error("Invalid asset type");
    }
  }
);

import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import type { getBondDetail } from "@/lib/queries/bond/bond-detail";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import type { VariablesOf } from "@settlemint/sdk-portal";
import { parseUnits } from "viem";
import type { WithdrawInput } from "./withdraw-schema";

/**
 * GraphQL mutation for withdrawing the underlying asset of a bond
 */
// const BondWithdrawUnderlyingAsset = portalGraphql(`
//   mutation BondWithdrawUnderlyingAsset(
//     $challengeResponse: String!
//     $verificationId: String
//     $address: String!
//     $from: String!
//     $input: BondWithdrawUnderlyingAssetInput!
//   ) {
//     BondWithdrawUnderlyingAsset(
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
 * GraphQL mutation for withdrawing the underlying asset of a yield schedule
 */
// const FixedYieldWithdrawUnderlyingAsset = portalGraphql(`
//   mutation FixedYieldWithdrawUnderlyingAsset(
//     $challengeResponse: String!
//     $verificationId: String
//     $address: String!
//     $from: String!
//     $input: FixedYieldWithdrawUnderlyingAssetInput!
//   ) {
//     FixedYieldWithdrawUnderlyingAsset(
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
 * GraphQL mutation for withdrawing token from an equity
 */
// const EquityWithdrawToken = portalGraphql(`
//   mutation EquityWithdrawToken(
//     $challengeResponse: String!
//     $verificationId: String
//     $address: String!
//     $from: String!
//     $input: EquityWithdrawTokenInput!
//   ) {
//     EquityWithdrawToken(
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
 * GraphQL mutation for withdrawing token from a fund
 */
// const FundWithdrawToken = portalGraphql(`
//   mutation FundWithdrawToken(
//     $challengeResponse: String!
//     $verificationId: String
//     $address: String!
//     $from: String!
//     $input: FundWithdrawTokenInput!
//   ) {
//     FundWithdrawToken(
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
 * GraphQL mutation for withdrawing token from a cryptocurrency
 */
// const CryptoCurrencyWithdrawToken = portalGraphql(`
//   mutation CryptoCurrencyWithdrawToken(
//     $challengeResponse: String!
//     $verificationId: String
//     $address: String!
//     $from: String!
//     $input: CryptoCurrencyWithdrawTokenInput!
//   ) {
//     CryptoCurrencyWithdrawToken(
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
 * GraphQL mutation for withdrawing token from a stablecoin
 */
// const StableCoinWithdrawToken = portalGraphql(`
//   mutation StableCoinWithdrawToken(
//     $challengeResponse: String!
//     $verificationId: String
//     $address: String!
//     $from: String!
//     $input: StableCoinWithdrawTokenInput!
//   ) {
//     StableCoinWithdrawToken(
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
 * GraphQL mutation for withdrawing token from a tokenized deposit
 */
// const DepositWithdrawToken = portalGraphql(`
//   mutation DepositWithdrawToken(
//     $challengeResponse: String!
//     $verificationId: String
//     $address: String!
//     $from: String!
//     $input: DepositWithdrawTokenInput!
//   ) {
//     DepositWithdrawToken(
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
 * Function to withdraw tokens or underlying assets from a contract
 *
 * @param input - Validated input containing address, verificationCode, amount, to, underlyingAssetAddress, and assettype
 * @param user - The user executing the withdraw operation
 * @returns Array of transaction hashes
 */
export const withdrawFunction = withAccessControl(
  {
    requiredPermissions: {
      asset: ["manage"],
    },
  },
  async ({
    parsedInput: {
      assettype,
      target,
      targetAddress,
      verificationCode,
      verificationType,
      amount,
      to,
      underlyingAssetAddress,
    },
    ctx: { user },
  }: {
    parsedInput: WithdrawInput;
    ctx: { user: User };
  }) => {
    const asset = await getAssetDetail({
      address: targetAddress,
      assettype,
    });

    // Token input format (for tokens)
    const tokenInput: VariablesOf<
      | typeof EquityWithdrawToken
      | typeof FundWithdrawToken
      | typeof CryptoCurrencyWithdrawToken
      | typeof StableCoinWithdrawToken
      | typeof DepositWithdrawToken
    >["input"] = {
      token: underlyingAssetAddress,
      to,
      amount: parseUnits(amount.toString(), asset.decimals).toString(),
    };

    // Common parameters for token mutations
    const tokenParams: VariablesOf<
      | typeof EquityWithdrawToken
      | typeof FundWithdrawToken
      | typeof CryptoCurrencyWithdrawToken
      | typeof StableCoinWithdrawToken
      | typeof DepositWithdrawToken
    > = {
      address: targetAddress,
      from: user.wallet,
      input: tokenInput,
      ...(await handleChallenge(
        user,
        user.wallet,
        verificationCode,
        verificationType
      )),
    };

    switch (assettype) {
      case "bond": {
        // Withdraw underlying asset from bond

        const isYield = target === "yield";
        const bondDetails = asset as Awaited<ReturnType<typeof getBondDetail>>;
        if (isYield && !bondDetails.yieldSchedule) {
          throw new Error("Bond does not have a yield schedule");
        }

        const bondFormattedAmount = parseUnits(
          amount.toString(),
          isYield
            ? bondDetails.yieldSchedule!.underlyingAsset.decimals
            : bondDetails.underlyingAsset.decimals
        ).toString();

        if (isYield) {
            // const response = await portalClient.request(
  //             FixedYieldWithdrawUnderlyingAsset,
  //             {
  //               address: bondDetails.yieldSchedule!.id,
  //               from: user.wallet,
  //               input: {
  //                 to,
  //                 amount: bondFormattedAmount,
  //               },
  //               ...(await handleChallenge(
  //                 user,
  //                 user.wallet,
  //                 verificationCode,
  //                 verificationType
  //               )),
  //             }
  //           );

          // NOTE: HARDCODED SO IT STILL COMPILES
          const mockTxHash = "0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92";

          return waitForIndexingTransactions(
            safeParse(t.Hashes(), [mockTxHash
            ])
          );
        } else {
            // const response = await portalClient.request(
  //             BondWithdrawUnderlyingAsset,
  //             {
  //               address: targetAddress,
  //               from: user.wallet,
  //               input: {
  //                 to,
  //                 amount: bondFormattedAmount,
  //               },
  //               ...(await handleChallenge(
  //                 user,
  //                 user.wallet,
  //                 verificationCode,
  //                 verificationType
  //               )),
  //             }
  //           );

          // NOTE: HARDCODED SO IT STILL COMPILES
          const mockTxHash2 = "0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92";

          return waitForIndexingTransactions(
            safeParse(t.Hashes(), [mockTxHash2
            ])
          );
        }
      }
      case "cryptocurrency": {
          // const response = await portalClient.request(
  //           CryptoCurrencyWithdrawToken,
  //           tokenParams
  //         );
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92"]) /* response.CryptoCurrencyWithdrawToken?.transactionHash */
        );
      }
      case "equity": {
          // const response = await portalClient.request(
  //           EquityWithdrawToken,
  //           tokenParams
  //         );
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92"]) // ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.EquityWithdrawToken?.transactionHash */]
        );
      }
      case "fund": {
          // const response = await portalClient.request(
  //           FundWithdrawToken,
  //           tokenParams
  //         );
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92"]) // ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92" /* response.FundWithdrawToken?.transactionHash */]
        );
      }
      case "stablecoin": {
          // const response = await portalClient.request(
  //           StableCoinWithdrawToken,
  //           tokenParams
  //         );
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92"]) /* response.StableCoinWithdrawToken?.transactionHash */
        );
      }
      case "deposit": {
          // const response = await portalClient.request(
  //           DepositWithdrawToken,
  //           tokenParams
  //         );
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), ["0x8fba129ea4afb26988c3d9c32b576d5fceefa3aa7bf9357d4348547c3a11af92"]) /* response.DepositWithdrawToken?.transactionHash */
        );
      }
      default:
        throw new Error("Invalid asset type");
    }
  }
);

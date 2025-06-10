import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import type { VariablesOf } from "@settlemint/sdk-portal";
import { parseUnits } from "viem";
import type { MintInput } from "./mint-schema";

/**
 * GraphQL mutation to mint new bond tokens
 */
// const BondMint = portalGraphql(`
//   mutation BondMint(
//     $challengeResponse: String!,
//     $verificationId: String,
//     $address: String!,
//     $from: String!,
//     $input: BondMintInput!
//   ) {
//     BondMint(
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
 * GraphQL mutation to mint new cryptocurrency tokens
 */
// const CryptoCurrencyMint = portalGraphql(`
//   mutation CryptoCurrencyMint(
//     $challengeResponse: String!,
//     $verificationId: String,
//     $address: String!,
//     $from: String!,
//     $input: CryptoCurrencyMintInput!
//   ) {
//     CryptoCurrencyMint(
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
 * GraphQL mutation to mint new equity tokens
 */
// const EquityMint = portalGraphql(`
//   mutation EquityMint(
//     $challengeResponse: String!,
//     $verificationId: String,
//     $address: String!,
//     $from: String!,
//     $input: EquityMintInput!
//   ) {
//     EquityMint(
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
 * GraphQL mutation to mint new fund tokens
 */
// const FundMint = portalGraphql(`
//   mutation FundMint(
//     $challengeResponse: String!,
//     $verificationId: String,
//     $address: String!,
//     $from: String!,
//     $input: FundMintInput!
//   ) {
//     FundMint(
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
 * GraphQL mutation to mint new stablecoin tokens
 */
// const StableCoinMint = portalGraphql(`
//   mutation StableCoinMint(
//     $challengeResponse: String!,
//     $verificationId: String,
//     $address: String!,
//     $from: String!,
//     $input: StableCoinMintInput!
//   ) {
//     StableCoinMint(
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
 * GraphQL mutation to mint new tokenized deposit tokens
 */
// const DepositMint = portalGraphql(`
//   mutation DepositMint(
//     $challengeResponse: String!,
//     $verificationId: String,
//     $address: String!,
//     $from: String!,
//     $input: DepositMintInput!
//   ) {
//     DepositMint(
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
 * Function to mint new tokens for a specific asset type
 *
 * @param input - Validated input containing address, verificationCode, amount, to, and assettype
 * @param user - The user executing the mint operation
 * @returns Array of transaction hashes
 */
export const mintFunction = withAccessControl(
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
      amount,
      to,
      assettype,
    },
    ctx: { user },
  }: {
    parsedInput: MintInput;
    ctx: { user: User };
  }) => {
    // Get token details based on asset type
    const { decimals } = await getAssetDetail({
      address,
      assettype,
    });

    // Common parameters for all mutations
    const params: VariablesOf<
      | typeof BondMint
      | typeof CryptoCurrencyMint
      | typeof EquityMint
      | typeof FundMint
      | typeof StableCoinMint
      | typeof DepositMint
    > = {
      address,
      from: user.wallet,
      input: {
        amount: parseUnits(amount.toString(), decimals).toString(),
        to,
      },
      ...(await handleChallenge(
        user,
        user.wallet,
        verificationCode,
        verificationType
      )),
    };

    // NOTE: HARDCODED SO IT STILL COMPILES
    const mockTxHash = "0x7890123a7890123a7890123a7890123a7890123a7890123a7890123a7890123a";
    
    switch (assettype) {
      case "bond": {
        // const response = await portalClient.request(BondMint, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), [mockTxHash])
        );
      }
      case "cryptocurrency": {
        // const response = await portalClient.request(CryptoCurrencyMint, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), [mockTxHash])
        );
      }
      case "equity": {
        // const response = await portalClient.request(EquityMint, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), [mockTxHash])
        );
      }
      case "fund": {
        // const response = await portalClient.request(FundMint, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), [mockTxHash])
        );
      }
      case "stablecoin": {
        // const response = await portalClient.request(StableCoinMint, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), [mockTxHash])
        );
      }
      case "deposit": {
        // const response = await portalClient.request(DepositMint, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), [mockTxHash])
        );
      }
      default:
        throw new Error("Invalid asset type");
    }
  }
);

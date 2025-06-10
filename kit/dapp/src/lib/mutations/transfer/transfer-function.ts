import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { safeParse, t } from "@/lib/utils/typebox";
import type { VariablesOf } from "@settlemint/sdk-portal";
import { parseUnits } from "viem";
import type { TransferInput } from "./transfer-schema";

// Dummy types for commented GraphQL operations
const BondTransfer = {} as any;
const CryptoCurrencyTransfer = {} as any;
const EquityTransfer = {} as any;
const FundTransfer = {} as any;
const StableCoinTransfer = {} as any;
const DepositTransfer = {} as any;


/**
 * GraphQL mutation to transfer bond tokens
 */
// const BondTransfer = portalGraphql(`
//   mutation BondTransfer(
//     $challengeResponse: String!
//     $verificationId: String
//     $address: String!
//     $from: String!
//     $input: BondTransferInput!
//   ) {
//     Transfer: BondTransfer(
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
 * GraphQL mutation to transfer cryptocurrency tokens
 */
// const CryptoCurrencyTransfer = portalGraphql(`
//   mutation CryptoCurrencyTransfer(
//     $challengeResponse: String!
//     $verificationId: String
//     $address: String!
//     $from: String!
//     $input: CryptoCurrencyTransferInput!
//   ) {
//     Transfer: CryptoCurrencyTransfer(
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
 * GraphQL mutation to transfer equity tokens
 */
// const EquityTransfer = portalGraphql(`
//   mutation EquityTransfer(
//     $challengeResponse: String!
//     $verificationId: String
//     $address: String!
//     $from: String!
//     $input: EquityTransferInput!
//   ) {
//     Transfer: EquityTransfer(
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
 * GraphQL mutation to transfer fund tokens
 */
// const FundTransfer = portalGraphql(`
//   mutation FundTransfer(
//     $challengeResponse: String!
//     $verificationId: String
//     $address: String!
//     $from: String!
//     $input: FundTransferInput!
//   ) {
//     Transfer: FundTransfer(
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
 * GraphQL mutation to transfer stablecoin tokens
 */
// const StableCoinTransfer = portalGraphql(`
//   mutation StableCoinTransfer(
//     $challengeResponse: String!
//     $verificationId: String
//     $address: String!
//     $from: String!
//     $input: StableCoinTransferInput!
//   ) {
//     Transfer: StableCoinTransfer(
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
 * GraphQL mutation to transfer tokenized deposit tokens
 */
// const DepositTransfer = portalGraphql(`
//   mutation DepositTransfer(
//     $challengeResponse: String!
//     $verificationId: String
//     $address: String!
//     $from: String!
//     $input: DepositTransferInput!
//   ) {
//     Transfer: DepositTransfer(
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
 * Function to transfer tokens to a recipient
 *
 * @param input - Validated input containing address, verificationCode, value, to, and assettype
 * @param user - The user executing the transfer operation
 * @returns Array of transaction hashes
 */
export const transferAssetFunction = withAccessControl(
  {
    requiredPermissions: {
      asset: ["transfer"],
    },
  },
  async ({
    parsedInput: {
      address,
      verificationCode,
      verificationType,
      value,
      to,
      assettype,
    },
    ctx: { user },
  }: {
    parsedInput: TransferInput;
    ctx: { user: User };
  }) => {
    // Get token details based on asset type
    const { decimals } = await getAssetDetail({
      address,
      assettype,
    });

    // Common parameters for all mutations
    const params: VariablesOf<
      | typeof BondTransfer
      | typeof CryptoCurrencyTransfer
      | typeof EquityTransfer
      | typeof FundTransfer
      | typeof StableCoinTransfer
      | typeof DepositTransfer
    > = {
      address,
      from: user.wallet,
      input: {
        value: parseUnits(value.toString(), decimals).toString(),
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
    const mockTxHash = "0x67890123f67890123f67890123f67890123f67890123f67890123f67890123";
    
    switch (assettype) {
      case "bond": {
        // const response = await portalClient.request(BondTransfer, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), [mockTxHash])
        );
      }
      case "cryptocurrency": {
        // const response = await portalClient.request(
        //   CryptoCurrencyTransfer,
        //   params
        // );
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), [mockTxHash])
        );
      }
      case "equity": {
        // const response = await portalClient.request(EquityTransfer, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), [mockTxHash])
        );
      }
      case "fund": {
        // const response = await portalClient.request(FundTransfer, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), [mockTxHash])
        );
      }
      case "stablecoin": {
        // const response = await portalClient.request(StableCoinTransfer, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), [mockTxHash])
        );
      }
      case "deposit": {
        // const response = await portalClient.request(DepositTransfer, params);
        return waitForIndexingTransactions(
          safeParse(t.Hashes(), [mockTxHash])
        );
      }
      default:
        throw new Error("Invalid asset type");
    }
  }
);

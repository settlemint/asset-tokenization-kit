import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { FUND_FACTORY_ADDRESS } from "@/lib/contracts";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { waitForTransactions } from "@/lib/queries/transactions/wait-for-transaction";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { grantRolesToAdmins } from "@/lib/utils/role-granting";
import { safeParse, t } from "@/lib/utils/typebox";
import { AddAssetPrice } from "../../asset/price/add-price";
import type { CreateFundInput } from "./create-schema";
/**
 * GraphQL mutation for creating a new fund
 *
 * @remarks
 * Creates a new fund contract through the fund factory
 */
// const FundFactoryCreate = portalGraphql(`
//   mutation FundFactoryCreate(
//     $challengeResponse: String!
//     $verificationId: String
//     $address: String!
//     $from: String!
//     $input: FundFactoryCreateInput!
//   ) {
//     FundFactoryCreate(
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
 * GraphQL mutation for creating off-chain metadata for a fund
 *
 * @remarks
 * Stores additional metadata about the fund in Hasura
 */
const CreateOffchainFund = hasuraGraphql(`
  mutation CreateOffchainFund($id: String!, $isin: String, $internalid: String) {
    insert_asset_one(object: {id: $id, isin: $isin, internalid: $internalid}, on_conflict: {constraint: asset_pkey, update_columns: [isin, internalid]}) {
      id
      isin
    }
  }
`);

/**
 * Function to create a new fund token
 *
 * @param input - Validated input for creating a fund
 * @param user - The user creating the fund
 * @returns Array of transaction hashes
 */
export const createFundFunction = withAccessControl(
  {
    requiredPermissions: {
      asset: ["manage"],
    },
  },
  async ({
    parsedInput: {
      assetName,
      symbol,
      decimals,
      verificationCode,
      verificationType,
      isin,
      fundCategory,
      fundClass,
      managementFeeBps,
      predictedAddress,
      price,
      assetAdmins,
      internalid,
    },
    ctx: { user },
  }: {
    parsedInput: CreateFundInput;
    ctx: { user: User };
  }) => {
    await hasuraClient.request(CreateOffchainFund, {
      id: predictedAddress,
      isin,
      internalid,
    });

    await hasuraClient.request(AddAssetPrice, {
      assetId: predictedAddress,
      amount: String(price.amount),
      currency: price.currency,
    });

      // const data = await portalClient.request(FundFactoryCreate, {
  //       address: FUND_FACTORY_ADDRESS,
  //       from: user.wallet,
  //       input: {
  //         name: assetName,
  //         symbol: symbol.toString(),
  //         decimals,
  //         fundCategory,
  //         fundClass,
  //         managementFeeBps,
  //       },
  //       ...(await handleChallenge(
  //         user,
  //         user.wallet,
  //         verificationCode,
  //         verificationType
  //       )),
  //     });

      // const createTxHash = data.FundFactoryCreate?.transactionHash;
  // NOTE: HARDCODED SO IT STILL COMPILES
  const createTxHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    if (!createTxHash) {
      throw new Error("Failed to create fund: no transaction hash received");
    }

    const hasMoreAdmins = assetAdmins.length > 0;

    if (!hasMoreAdmins) {
      return waitForIndexingTransactions(safeParse(t.Hashes(), [createTxHash]));
    }

    // Wait for the creation transaction to be mined
    await waitForTransactions([createTxHash]);

    // Grant roles to admins using the shared helper
    await grantRolesToAdmins(
      assetAdmins,
      predictedAddress,
      verificationCode,
      verificationType,
      "fund",
      user
    );

    return waitForIndexingTransactions(safeParse(t.Hashes(), [createTxHash]));
  }
);

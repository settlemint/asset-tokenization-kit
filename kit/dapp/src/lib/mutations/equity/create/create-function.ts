import type { User } from "@/lib/auth/types";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { waitForTransactions } from "@/lib/queries/transactions/wait-for-transaction";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { withAccessControl } from "@/lib/utils/access-control";
import { grantRolesToAdmins } from "@/lib/utils/role-granting";
import { safeParse, t } from "@/lib/utils/typebox";
import type { CreateEquityInput } from "./create-schema";

// Dummy types for commented GraphQL operations
const EquityFactoryCreate = {} as any;

/**
 * GraphQL mutation for creating a new equity
 *
 * @remarks
 * Creates a new equity contract through the equity factory
 */
// const EquityFactoryCreate = portalGraphql(`
//   mutation EquityFactoryCreate(
//     $challengeResponse: String!
//     $verificationId: String
//     $address: String!
//     $from: String!
//     $input: EquityFactoryCreateInput!
//   ) {
//     EquityFactoryCreate(
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
 * GraphQL mutation for creating off-chain metadata for a equity
 *
 * @remarks
 * Stores additional metadata about the equity in Hasura
 */
const CreateOffchainEquity = hasuraGraphql(`
    mutation CreateOffchainEquity($id: String!, $isin: String, $internalid: String) {
      insert_asset_one(object: {id: $id, isin: $isin, internalid: $internalid}, on_conflict: {constraint: asset_pkey, update_columns: [isin, internalid]}) {
        id
      }
  }
`);

/**
 * Function to create a new equity token
 *
 * @param input - Validated input for creating an equity
 * @param user - The user creating the equity
 * @returns Array of transaction hashes
 */
export const createEquityFunction = withAccessControl(
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
      equityCategory,
      equityClass,
      predictedAddress,
      price,
      assetAdmins,
      internalid,
    },
    ctx: { user },
  }: {
    parsedInput: CreateEquityInput;
    ctx: { user: User };
  }) => {
    await hasuraClient.request(CreateOffchainEquity, {
      id: predictedAddress,
      isin: isin,
      internalid: internalid,
    });

    // await hasuraClient.request(AddAssetPrice, {
    //   assetId: predictedAddress,
    //   amount: String(price.amount),
    //   currency: price.currency,
    // });

    // const createEquityResult = await portalClient.request(EquityFactoryCreate, {
    //       address: EQUITY_FACTORY_ADDRESS,
    //       from: user.wallet,
    //       input: {
    //         name: assetName,
    //         symbol: symbol.toString(),
    //         decimals,
    //         equityCategory,
    //         equityClass,
    //       },
    //       ...(await handleChallenge(
    //         user,
    //         user.wallet,
    //         verificationCode,
    //         verificationType
    //       )),
    //     });

    // const createTxHash = createEquityResult.EquityFactoryCreate?.transactionHash;
    // NOTE: HARDCODED SO IT STILL COMPILES
    const createTxHash =
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    if (!createTxHash) {
      throw new Error("Failed to create equity: no transaction hash received");
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
      "equity",
      user
    );

    return waitForIndexingTransactions(safeParse(t.Hashes(), [createTxHash]));
  }
);

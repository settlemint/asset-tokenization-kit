import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { DEPOSIT_FACTORY_ADDRESS } from "@/lib/contracts";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { waitForTransactions } from "@/lib/queries/transactions/wait-for-transaction";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { getTimeUnitSeconds } from "@/lib/utils/date";
import { grantRolesToAdmins } from "@/lib/utils/role-granting";
import { safeParse, t } from "@/lib/utils/typebox";
import { AddAssetPrice } from "../../asset/price/add-price";
import type { CreateDepositInput } from "./create-schema";

/**
 * GraphQL mutation for creating a new tokenized deposit
 *
 * @remarks
 * Creates a new tokenized deposit contract through the tokenized deposit factory
 */
const DepositFactoryCreate = portalGraphql(`
  mutation DepositFactoryCreate(
    $challengeResponse: String!
    $verificationId: String
    $address: String!
    $from: String!
    $input: DepositFactoryCreateInput!
  ) {
    DepositFactoryCreate(
      challengeResponse: $challengeResponse
      verificationId: $verificationId
      address: $address
      from: $from
      input: $input
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for creating off-chain metadata for a tokenized deposit
 *
 * @remarks
 * Stores additional metadata about the tokenized deposit in Hasura
 */
const CreateOffchainDeposit = hasuraGraphql(`
  mutation CreateOffchainDeposit($id: String!, $isin: String) {
    insert_asset_one(object: {id: $id, isin: $isin}, on_conflict: {constraint: asset_pkey, update_columns: isin}) {
      id
    }
  }
`);

/**
 * Function to create a new tokenized deposit token
 *
 * @param input - Validated input for creating a tokenized deposit
 * @param user - The user creating the tokenized deposit
 * @returns Array of transaction hashes
 */
export const createDepositFunction = withAccessControl(
  { requiredPermissions: { asset: ["manage"] } },
  async ({
    parsedInput: {
      assetName,
      symbol,
      decimals,
      collateralLivenessValue,
      collateralLivenessTimeUnit,
      verificationCode,
      verificationType,
      isin,
      predictedAddress,
      price,
      assetAdmins,
      internalid,
    },
    ctx: { user },
  }: {
    parsedInput: CreateDepositInput;
    ctx: { user: User };
  }) => {
    await hasuraClient.request(CreateOffchainDeposit, {
      id: predictedAddress,
      isin,
      internalid,
    });

    await hasuraClient.request(AddAssetPrice, {
      assetId: predictedAddress,
      amount: String(price.amount),
      currency: price.currency,
    });

    const collateralLivenessSeconds = getTimeUnitSeconds(
      collateralLivenessValue,
      collateralLivenessTimeUnit
    );

    const createDepositResult = await portalClient.request(
      DepositFactoryCreate,
      {
        address: DEPOSIT_FACTORY_ADDRESS,
        from: user.wallet,
        input: {
          name: assetName,
          symbol: symbol.toString(),
          decimals,
          collateralLivenessSeconds,
        },
        ...(await handleChallenge(
          user,
          user.wallet,
          verificationCode,
          verificationType
        )),
      }
    );

    const createTxHash =
      createDepositResult.DepositFactoryCreate?.transactionHash;
    if (!createTxHash) {
      throw new Error("Failed to create deposit: no transaction hash received");
    }

    const hasMoreAdmins = assetAdmins.length > 0;

    if (!hasMoreAdmins) {
      return waitForIndexingTransactions(safeParse(t.Hashes(), [createTxHash]));
    }

    // Wait for the creation transaction to be mined
    await waitForTransactions([createTxHash]);

    // Grant roles to admins using the shared helper
    const roleGrantHashes = await grantRolesToAdmins(
      assetAdmins,
      predictedAddress,
      verificationCode,
      verificationType,
      "deposit",
      user
    );

    // Combine all transaction hashes
    const allTransactionHashes = [createTxHash, ...roleGrantHashes];

    return waitForIndexingTransactions(
      safeParse(t.Hashes(), allTransactionHashes)
    );
  }
);

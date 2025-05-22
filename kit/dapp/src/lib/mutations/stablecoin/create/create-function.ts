import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { STABLE_COIN_FACTORY_ADDRESS } from "@/lib/contracts";
import { waitForTransactions } from "@/lib/queries/transactions/wait-for-transaction";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withAccessControl } from "@/lib/utils/access-control";
import { getTimeUnitSeconds } from "@/lib/utils/date";
import { grantRolesToAdmins } from "@/lib/utils/role-granting";
import { safeParse, t } from "@/lib/utils/typebox";
import { AddAssetPrice } from "../../asset/price/add-price";
import type { CreateStablecoinInput } from "./create-schema";

/**
 * GraphQL mutation for creating a new stablecoin
 *
 * @remarks
 * Creates a new stablecoin contract through the stablecoin factory
 */
const StableCoinFactoryCreate = portalGraphql(`
  mutation StableCoinFactoryCreate(
    $challengeResponse: String!
    $verificationId: String
    $address: String!
    $from: String!
    $input: StableCoinFactoryCreateInput!
  ) {
    StableCoinFactoryCreate(
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
 * GraphQL mutation for creating off-chain metadata for a stablecoin
 *
 * @remarks
 * Stores additional metadata about the stablecoin in Hasura
 * The on_conflict parameter provides idempotency:
 * - If this asset doesn't exist yet, create it
 * - If it already exists (same primary key), do nothing (empty update_columns)
 * This prevents errors if the operation is retried and handles race conditions
 * where multiple requests might try to create the same asset simultaneously
 */
const CreateOffchainStablecoin = hasuraGraphql(`
    mutation CreateOffchainStablecoin($id: String!, $isin: String, $internalid: String) {
      insert_asset_one(
        object: {id: $id, isin: $isin, internalid: $internalid},
        on_conflict: {
          constraint: asset_pkey,
          update_columns: [isin, internalid]
        }
      ) {
        id
      }
  }
`);

/**
 * Function to create a new stablecoin token
 *
 * @param input - Validated input for creating a stablecoin
 * @param user - The user creating the stablecoin
 * @returns Array of transaction hashes
 */
export const createStablecoinFunction = withAccessControl(
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
      collateralLivenessValue,
      collateralLivenessTimeUnit,
      predictedAddress,
      price,
      assetAdmins,
      isin,
      internalid,
    },
    ctx: { user },
  }: {
    parsedInput: CreateStablecoinInput;
    ctx: { user: User };
  }) => {
    await hasuraClient.request(CreateOffchainStablecoin, {
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

    const createStablecoinResult = await portalClient.request(
      StableCoinFactoryCreate,
      {
        address: STABLE_COIN_FACTORY_ADDRESS,
        from: user.wallet,
        input: {
          name: assetName,
          symbol: symbol.toString(),
          decimals: decimals || 6,
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
      createStablecoinResult.StableCoinFactoryCreate?.transactionHash;
    if (!createTxHash) {
      throw new Error(
        "Failed to create stablecoin: no transaction hash received"
      );
    }

    const hasMoreAdmins = assetAdmins.length > 0;

    if (!hasMoreAdmins) {
      return safeParse(t.Hashes(), [createTxHash]);
    }

    // Wait for the creation transaction to be mined
    await waitForTransactions([createTxHash]);

    // Grant roles to admins using the shared helper
    const roleGrantHashes = await grantRolesToAdmins(
      assetAdmins,
      predictedAddress,
      verificationCode,
      verificationType,
      "stablecoin",
      user
    );

    // Combine all transaction hashes
    const allTransactionHashes = [createTxHash, ...roleGrantHashes];

    return safeParse(t.Hashes(), allTransactionHashes);
  }
);

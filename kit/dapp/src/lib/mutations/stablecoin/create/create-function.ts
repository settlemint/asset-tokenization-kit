import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { STABLE_COIN_FACTORY_ADDRESS } from "@/lib/contracts";
import { waitForTransactions } from "@/lib/queries/transactions/wait-for-transaction";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { getTimeUnitSeconds } from "@/lib/utils/date";
import { safeParse, t } from "@/lib/utils/typebox";
import { grantRoleFunction } from "../../asset/access-control/grant-role/grant-role-function";
import { AddAssetPrice } from "../../asset/price/add-price";
import type { CreateStablecoinInput } from "./create-schema";

/**
 * GraphQL mutation for creating a new stablecoin
 *
 * @remarks
 * Creates a new stablecoin contract through the stablecoin factory
 */
const StableCoinFactoryCreate = portalGraphql(`
  mutation StableCoinFactoryCreate($address: String!, $from: String!, $name: String!, $symbol: String!, $decimals: Int!, $challengeResponse: String!, $collateralLivenessSeconds: Float!) {
    StableCoinFactoryCreate(
      address: $address
      from: $from
      input: {collateralLivenessSeconds: $collateralLivenessSeconds, name: $name, symbol: $symbol, decimals: $decimals}
      challengeResponse: $challengeResponse
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
    mutation CreateOffchainStablecoin($id: String!) {
      insert_asset_one(
        object: {id: $id},
        on_conflict: {
          constraint: asset_pkey,
          update_columns: []
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
export async function createStablecoinFunction({
  parsedInput: {
    assetName,
    symbol,
    decimals,
    pincode,
    collateralLivenessValue,
    collateralLivenessTimeUnit,
    predictedAddress,
    price,
    assetAdmins,
  },
  ctx: { user },
}: {
  parsedInput: CreateStablecoinInput;
  ctx: { user: User };
}) {
  await hasuraClient.request(CreateOffchainStablecoin, {
    id: predictedAddress,
  });

  await hasuraClient.request(AddAssetPrice, {
    assetId: predictedAddress,
    amount: String(price.amount),
    currency: price.currency,
  });

  const createStablecoinResult = await portalClient.request(StableCoinFactoryCreate, {
    address: STABLE_COIN_FACTORY_ADDRESS,
    from: user.wallet,
    name: assetName,
    symbol: symbol.toString(),
    decimals: decimals || 6, // Provide fallback for decimals
    collateralLivenessSeconds: (collateralLivenessValue || 12) * getTimeUnitSeconds(collateralLivenessTimeUnit || "months"),
    challengeResponse: await handleChallenge(user.wallet, pincode),
  });

  const createTxHash = createStablecoinResult.StableCoinFactoryCreate?.transactionHash;
  if (!createTxHash) {
    throw new Error("Failed to create stablecoin: no transaction hash received");
  }

  // Wait for the stablecoin creation transaction to be mined
  await waitForTransactions([createTxHash]);

  // After stablecoin is created, grant roles to admins in parallel
  const grantRolePromises = assetAdmins.map(async (admin) => {
    const roles = {
      DEFAULT_ADMIN_ROLE: admin.roles.includes("admin"),
      SUPPLY_MANAGEMENT_ROLE: admin.roles.includes("issuer"),
      USER_MANAGEMENT_ROLE: admin.roles.includes("user-manager"),
    };

    return grantRoleFunction({
      parsedInput: {
        address: predictedAddress,
        roles,
        userAddress: admin.wallet,
        pincode,
        assettype: "stablecoin",
      },
      ctx: { user },
    });
  });

  // Get all role grant transaction hashes
  const grantRoleResults = await Promise.all(grantRolePromises);
  const roleGrantHashes = grantRoleResults.flatMap((result) => result);

  // Combine all transaction hashes
  const allTransactionHashes = [createTxHash, ...roleGrantHashes];

  return safeParse(t.Hashes(), allTransactionHashes);
}

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
 */
const CreateOffchainStablecoin = hasuraGraphql(`
    mutation CreateOffchainStablecoin($id: String!) {
      insert_asset_one(object: {id: $id}) {
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
    tokenAdmins,
  },
  ctx: { user },
}: {
  parsedInput: CreateStablecoinInput;
  ctx: { user: User };
}) {

  console.log("tokenAdmins", tokenAdmins);

  // Execute metadata operations in parallel
  await Promise.all([
    hasuraClient.request(CreateOffchainStablecoin, {
      id: predictedAddress,
    }),
    hasuraClient.request(AddAssetPrice, {
      assetId: predictedAddress,
      amount: String(price.amount),
      currency: price.currency,
    }),
  ]);

  // Create the stablecoin
  const createStablecoinResult = await portalClient.request(StableCoinFactoryCreate, {
    address: STABLE_COIN_FACTORY_ADDRESS,
    from: user.wallet,
    name: assetName,
    symbol: symbol.toString(),
    decimals,
    collateralLivenessSeconds: collateralLivenessValue * getTimeUnitSeconds(collateralLivenessTimeUnit),
    challengeResponse: await handleChallenge(user.wallet, pincode),
  });

  const createTxHash = createStablecoinResult.StableCoinFactoryCreate?.transactionHash;
  if (!createTxHash) {
    throw new Error("Failed to create stablecoin: no transaction hash received");
  }

  // Wait for the stablecoin creation transaction to be mined
  await waitForTransactions([createTxHash]);

  // After stablecoin is created, grant roles to admins in parallel
  const grantRolePromises = tokenAdmins.map(async (admin) => {
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

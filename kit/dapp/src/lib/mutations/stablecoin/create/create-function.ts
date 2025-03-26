import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { STABLE_COIN_FACTORY_ADDRESS } from "@/lib/contracts";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { getTimeUnitSeconds } from "@/lib/utils/date";
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

  const collateralLivenessSeconds =
    collateralLivenessValue * getTimeUnitSeconds(collateralLivenessTimeUnit);

  const data = await portalClient.request(StableCoinFactoryCreate, {
    address: STABLE_COIN_FACTORY_ADDRESS,
    from: user.wallet,
    name: assetName,
    symbol: symbol.toString(),
    decimals,
    collateralLivenessSeconds,
    challengeResponse: await handleChallenge(user.wallet, pincode),
  });

  return safeParse(t.Hashes(), [data.StableCoinFactoryCreate?.transactionHash]);
}

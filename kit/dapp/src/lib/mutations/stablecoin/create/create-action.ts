"use server";

import { handleChallenge } from "@/lib/challenge";
import { STABLE_COIN_FACTORY_ADDRESS } from "@/lib/contracts";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { getTimeUnitSeconds } from "@/lib/utils/date";
import { safeParseTransactionHash, z } from "@/lib/utils/zod";
import { action } from "../../safe-action";
import { CreateStablecoinSchema } from "./create-schema";

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
    mutation CreateOffchainStablecoin($id: String!, $value_in_base_currency: numeric) {
      insert_asset_one(object: {id: $id, value_in_base_currency: $value_in_base_currency}, on_conflict: {constraint: asset_pkey, update_columns: value_in_base_currency}) {
        id
      }
  }
`);

export const createStablecoin = action
  .schema(CreateStablecoinSchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: {
        assetName,
        symbol,
        decimals,
        pincode,
        collateralLivenessValue,
        collateralLivenessTimeUnit,
        predictedAddress,
        valueInBaseCurrency,
      },
      ctx: { user },
    }) => {
      await hasuraClient.request(CreateOffchainStablecoin, {
        id: predictedAddress,
        value_in_base_currency: String(valueInBaseCurrency),
      });

      const collateralLivenessSeconds =
        collateralLivenessValue *
        getTimeUnitSeconds(collateralLivenessTimeUnit);

      const data = await portalClient.request(StableCoinFactoryCreate, {
        address: STABLE_COIN_FACTORY_ADDRESS,
        from: user.wallet,
        name: assetName,
        symbol,
        decimals,
        collateralLivenessSeconds,
        challengeResponse: await handleChallenge(user.wallet, pincode),
      });

      return safeParseTransactionHash([
        data.StableCoinFactoryCreate?.transactionHash,
      ]);
    }
  );

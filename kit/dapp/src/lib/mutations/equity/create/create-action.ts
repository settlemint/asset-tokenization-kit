"use server";

import { handleChallenge } from "@/lib/challenge";
import { STABLE_COIN_FACTORY_ADDRESS } from "@/lib/contracts";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { z } from "@/lib/utils/zod";
import { action } from "../../safe-action";
import { CreateEquitySchema } from "./create-schema";

/**
 * GraphQL mutation for creating a new equity
 *
 * @remarks
 * Creates a new equity contract through the equity factory
 */
const EquityFactoryCreate = portalGraphql(`
  mutation EquityFactoryCreate($address: String!, $from: String!, $name: String!, $symbol: String!, $decimals: Int!, $challengeResponse: String!, $equityCategory: String!, $equityClass: String!) {
    EquityFactoryCreate(
      address: $address
      from: $from
      input: {name: $name, symbol: $symbol, decimals: $decimals, equityCategory: $equityCategory, equityClass: $equityClass}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL query for predicting the address of a new equity
 *
 * @remarks
 * Uses deterministic deployment to predict the contract address before creation
 */
const CreateEquityPredictAddress = portalGraphql(`
  query CreateEquityPredictAddress($address: String!, $sender: String!, $decimals: Int!, $name: String!, $symbol: String!, $equityCategory: String!, $equityClass: String!) {
    EquityFactory(address: $address) {
      predictAddress(
        sender: $sender
        decimals: $decimals
        name: $name
        symbol: $symbol
        equityCategory: $equityCategory
        equityClass: $equityClass
      ) {
        predicted
      }
    }
  }
`);

/**
 * GraphQL mutation for creating off-chain metadata for a equity
 *
 * @remarks
 * Stores additional metadata about the equity in Hasura
 */
const CreateOffchainEquity = hasuraGraphql(`
  mutation CreateOffchainEquity($id: String!, $isin: String) {
    insert_asset_one(object: {id: $id, isin: $isin}, on_conflict: {constraint: asset_pkey, update_columns: isin}) {
      id
    }
  }
`);

export const createEquity = action
  .schema(CreateEquitySchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: {
        assetName,
        symbol,
        decimals,
        pincode,
        isin,
        equityCategory,
        equityClass,
      },
      ctx: { user },
    }) => {
      const predictedAddress = await portalClient.request(
        CreateEquityPredictAddress,
        {
          address: STABLE_COIN_FACTORY_ADDRESS,
          sender: user.wallet,
          decimals,
          name: assetName,
          symbol,
          equityCategory,
          equityClass,
        }
      );

      const newAddress =
        predictedAddress.EquityFactory?.predictAddress?.predicted;

      if (!newAddress) {
        throw new Error("Failed to predict the address");
      }

      await hasuraClient.request(CreateOffchainEquity, {
        id: newAddress,
        isin: isin,
      });

      const data = await portalClient.request(EquityFactoryCreate, {
        address: STABLE_COIN_FACTORY_ADDRESS,
        from: user.wallet,
        name: assetName,
        symbol,
        decimals,
        challengeResponse: await handleChallenge(user.wallet, pincode),
        equityCategory,
        equityClass,
      });

      return z.hashes().parse([data.EquityFactoryCreate?.transactionHash]);
    }
  );

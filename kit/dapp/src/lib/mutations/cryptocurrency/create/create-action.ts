"use server";

import { handleChallenge } from "@/lib/challenge";
import { CRYPTO_CURRENCY_FACTORY_ADDRESS } from "@/lib/contracts";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { z } from "@/lib/utils/zod";
import { action } from "../../safe-action";
import { CreateCryptoCurrencySchema } from "./create-schema";

/**
 * GraphQL mutation for creating a new cryptocurrency
 *
 * @remarks
 * Creates a new cryptocurrency contract through the cryptocurrency factory
 */
const CryptoCurrencyFactoryCreate = portalGraphql(`
  mutation CryptoCurrencyFactoryCreate($address: String!, $from: String!, $name: String!, $symbol: String!, $decimals: Int!, $challengeResponse: String!, $initialSupply: String!) {
    CryptoCurrencyFactoryCreate(
      address: $address
      from: $from
      input: {name: $name, symbol: $symbol, decimals: $decimals, initialSupply: $initialSupply}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL query for predicting the address of a new cryptocurrency
 *
 * @remarks
 * Uses deterministic deployment to predict the contract address before creation
 */
const CreateCryptoCurrencyPredictAddress = portalGraphql(`
  query CreateCryptoCurrencyPredictAddress($address: String!, $sender: String!, $decimals: Int!, $name: String!, $symbol: String!, $initialSupply: String!) {
    CryptoCurrencyFactory(address: $address) {
      predictAddress(
        sender: $sender
        decimals: $decimals
        name: $name
        symbol: $symbol
        initialSupply: $initialSupply
      ) {
        predicted
      }
    }
  }
`);

/**
 * GraphQL mutation for creating off-chain metadata for a cryptocurrency
 *
 * @remarks
 * Stores additional metadata about the cryptocurrency in Hasura
 */
// const CreateOffchainCryptoCurrency = hasuraGraphql(`
//   mutation CreateOffchainCryptoCurrency($id: String!) {
//     insert_asset_one(object: {id: $id}, on_conflict: {constraint: asset_pkey, update_columns: isin}) {
//       id
//     }
//   }
// `);

export const createCryptoCurrency = action
  .schema(CreateCryptoCurrencySchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: {
        assetName,
        symbol,
        decimals,
        pincode,
        initialSupply = "0",
      },
      ctx: { user },
    }) => {
      const predictedAddress = await portalClient.request(
        CreateCryptoCurrencyPredictAddress,
        {
          address: CRYPTO_CURRENCY_FACTORY_ADDRESS,
          sender: user.wallet,
          decimals,
          name: assetName,
          symbol,
          initialSupply: initialSupply,
        }
      );

      const newAddress =
        predictedAddress.CryptoCurrencyFactory?.predictAddress?.predicted;

      if (!newAddress) {
        throw new Error("Failed to predict the address");
      }

      // await hasuraClient.request(CreateOffchainCryptoCurrency, {
      //   id: newAddress,
      //   isin,
      // });

      const data = await portalClient.request(CryptoCurrencyFactoryCreate, {
        address: CRYPTO_CURRENCY_FACTORY_ADDRESS,
        from: user.wallet,
        name: assetName,
        symbol,
        decimals,
        initialSupply: initialSupply,
        challengeResponse: await handleChallenge(user.wallet, pincode),
      });

      return z
        .hashes()
        .parse([data.CryptoCurrencyFactoryCreate?.transactionHash]);
    }
  );

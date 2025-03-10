"use server";

import { handleChallenge } from "@/lib/challenge";
import { CRYPTO_CURRENCY_FACTORY_ADDRESS } from "@/lib/contracts";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { z } from "@/lib/utils/zod";
import { parseUnits } from "viem";
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
        initialSupply,
        predictedAddress,
      },
      ctx: { user },
    }) => {
      const initialSupplyExact = String(
        parseUnits(String(initialSupply), decimals)
      );

      const data = await portalClient.request(CryptoCurrencyFactoryCreate, {
        address: CRYPTO_CURRENCY_FACTORY_ADDRESS,
        from: user.wallet,
        name: assetName,
        symbol,
        decimals,
        initialSupply: initialSupplyExact,
        challengeResponse: await handleChallenge(user.wallet, pincode),
      });

      return z
        .hashes()
        .parse([data.CryptoCurrencyFactoryCreate?.transactionHash]);
    }
  );

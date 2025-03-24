"use server";

import { handleChallenge } from "@/lib/challenge";
import { CRYPTO_CURRENCY_FACTORY_ADDRESS } from "@/lib/contracts";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
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
const CreateOffchainCryptoCurrency = hasuraGraphql(`
  mutation CreateOffchainCryptoCurrency($id: String!, $value_in_base_currency: numeric) {
    insert_asset_one(object: {id: $id, value_in_base_currency: $value_in_base_currency}) {
      id
    }
  }
`);

export const createCryptoCurrency = action
  .schema(CreateCryptoCurrencySchema())
  .outputSchema(t.Hashes())
  .action(
    async ({
      parsedInput: {
        assetName,
        symbol,
        decimals,
        pincode,
        initialSupply,
        predictedAddress,
        valueInBaseCurrency,
      },
      ctx: { user },
    }) => {
      const initialSupplyExact = String(
        parseUnits(String(initialSupply), decimals)
      );

      await hasuraClient.request(CreateOffchainCryptoCurrency, {
        id: predictedAddress,
        value_in_base_currency: String(valueInBaseCurrency),
      });

      const data = await portalClient.request(CryptoCurrencyFactoryCreate, {
        address: CRYPTO_CURRENCY_FACTORY_ADDRESS,
        from: user.wallet,
        name: assetName,
        symbol: String(symbol),
        decimals,
        initialSupply: initialSupplyExact,
        challengeResponse: await handleChallenge(user.wallet, pincode),
      });

      return safeParse(t.Hashes(), [
        data.CryptoCurrencyFactoryCreate?.transactionHash,
      ]);
    }
  );

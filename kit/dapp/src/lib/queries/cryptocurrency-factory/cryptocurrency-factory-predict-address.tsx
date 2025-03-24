"use server";
import { getUser } from "@/lib/auth/utils";
import { CRYPTO_CURRENCY_FACTORY_ADDRESS } from "@/lib/contracts";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse } from "@/lib/utils/typebox";
import { cache } from "react";
import { parseUnits, type Address } from "viem";
import {
  PredictedAddressSchema,
  type PredictAddressInput,
} from "./cryptocurrency-factory-schema";

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
 * Predicts the address of a new cryptocurrency
 *
 * @param input - The data for creating a new cryptocurrency
 * @returns The predicted address of the new cryptocurrency
 */
export const getPredictedAddress = cache(async (input: PredictAddressInput) => {
  const { assetName, symbol, decimals, initialSupply } = input;
  const user = await getUser();

  const initialSupplyExact = String(
    parseUnits(String(initialSupply), decimals)
  );

  const data = await portalClient.request(CreateCryptoCurrencyPredictAddress, {
    address: CRYPTO_CURRENCY_FACTORY_ADDRESS,
    sender: user.wallet as Address,
    decimals,
    name: assetName,
    symbol,
    initialSupply: initialSupplyExact,
  });

  const predictedAddress = safeParse(PredictedAddressSchema, data);

  return predictedAddress.CryptoCurrencyFactory.predictAddress.predicted;
});

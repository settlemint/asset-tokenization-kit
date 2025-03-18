"use server";
import { getUser } from "@/lib/auth/utils";
import { CRYPTO_CURRENCY_FACTORY_ADDRESS } from "@/lib/contracts";
import type { CreateCryptoCurrencyInput } from "@/lib/mutations/cryptocurrency/create/create-schema";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParseWithLogging, z } from "@/lib/utils/zod";
import { cache } from "react";
import { type Address, parseUnits } from "viem";

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

const PredictedAddressSchema = z.object({
  CryptoCurrencyFactory: z.object({
    predictAddress: z.object({
      predicted: z.address(),
    }),
  }),
});

/**
 * Predicts the address of a new cryptocurrency
 *
 * @param input - The data for creating a new cryptocurrency
 * @returns The predicted address of the new cryptocurrency
 */
export const getPredictedAddress = cache(
  async (input: CreateCryptoCurrencyInput) => {
    const { assetName: name, symbol, decimals, initialSupply } = input;
    const user = await getUser();

    const initialSupplyExact = String(
      parseUnits(String(initialSupply), decimals)
    );

    const data = await portalClient.request(
      CreateCryptoCurrencyPredictAddress,
      {
        address: CRYPTO_CURRENCY_FACTORY_ADDRESS,
        sender: user.wallet as Address,
        decimals,
        name,
        symbol,
        initialSupply: initialSupplyExact,
      }
    );

    const predictedAddress = safeParseWithLogging(
      PredictedAddressSchema,
      data,
      "cryptocurrency"
    );

    return predictedAddress.CryptoCurrencyFactory.predictAddress.predicted;
  }
);

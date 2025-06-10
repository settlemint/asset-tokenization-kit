"use server";
import { getUser } from "@/lib/auth/utils";
import { CRYPTO_CURRENCY_FACTORY_ADDRESS } from "@/lib/contracts";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withTracing } from "@/lib/utils/sentry-tracing";
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
export const getPredictedAddress = withTracing(
  "queries",
  "getPredictedAddress",
  async (input: PredictAddressInput) => {
    const user = await getUser();
    return getPredictedAddressForUser(input, user.wallet);
  }
);

/**
 * Predicts the address of a new cryptocurrency for a given user
 *
 * @param input - The data for creating a new cryptocurrency
 * @param userAddress - The address of the user creating the cryptocurrency
 * @returns The predicted address of the new cryptocurrency
 */
export const getPredictedAddressForUser = withTracing(
  "queries",
  "getPredictedAddressForUser",
  cache(async (input: PredictAddressInput, userAddress: Address) => {
    const { assetName, symbol, decimals, initialSupply } = input;

    const initialSupplyExact = String(
      parseUnits(String(initialSupply), decimals)
    );

    // Add timeout for the request
    const timeoutPromise = new Promise<null>((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out")), 10000); // 10 second timeout
    });

    // Race the actual request against the timeout
    const data = await Promise.race([
      portalClient.request(CreateCryptoCurrencyPredictAddress, {
        address: CRYPTO_CURRENCY_FACTORY_ADDRESS,
        sender: userAddress,
        decimals,
        name: assetName,
        symbol,
        initialSupply: initialSupplyExact,
      }),
      timeoutPromise,
    ]);

    if (!data) throw new Error("No data returned from prediction");

    const predictedAddress = safeParse(PredictedAddressSchema, data);
    return predictedAddress.CryptoCurrencyFactory.predictAddress.predicted;
  })
);

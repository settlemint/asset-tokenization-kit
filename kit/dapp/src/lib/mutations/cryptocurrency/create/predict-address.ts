"use server";
import { getUser } from "@/lib/auth/utils";
import { CRYPTO_CURRENCY_FACTORY_ADDRESS } from "@/lib/contracts";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { parseUnits, type Address } from "viem";
import type { CreateCryptoCurrencyInput } from "./create-schema";

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

export const getPredictedAddress = async (
  data: Omit<CreateCryptoCurrencyInput, "predictedAddress" | "pincode">
) => {
  const { assetName: name, symbol, decimals, initialSupply } = data;

  const user = await getUser("en"); // TODO: hardcoding the locale is not ideal
  const initialSupplyExact = String(
    parseUnits(String(initialSupply), decimals)
  );

  const predicted = await portalClient.request(
    CreateCryptoCurrencyPredictAddress,
    {
      address: CRYPTO_CURRENCY_FACTORY_ADDRESS,
      sender: user.wallet,
      decimals,
      name,
      symbol,
      initialSupply: initialSupplyExact,
    }
  );

  const address = predicted.CryptoCurrencyFactory?.predictAddress?.predicted;
  if (!address) {
    throw new Error("Failed to predict the address");
  }

  return address as Address;
};

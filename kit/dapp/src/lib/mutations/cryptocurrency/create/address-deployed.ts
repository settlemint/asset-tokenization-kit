"use server";

import { getUser } from "@/lib/auth/utils";
import { CRYPTO_CURRENCY_FACTORY_ADDRESS } from "@/lib/contracts";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { parseUnits } from "viem";
import { type CryptoCurrencyInput } from "./create-schema";

/**
 * GraphQL mutation for creating a new cryptocurrency
 *
 * @remarks
 * Creates a new cryptocurrency contract through the cryptocurrency factory
 */
const IsAddressDeployed = portalGraphql(`
  query IsAddressDeployed($address: String!, $predicted: String!) {
    CryptoCurrencyFactory(address: $address) {
      isAddressDeployed(predicted: $predicted)
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

export const isAddressDeployed = async (data: CryptoCurrencyInput) => {
  const { assetName, symbol, decimals, initialSupply } = data;
  const user = await getUser("en"); // TODO: hardcoding the locale is not ideal
  const initialSupplyExact = String(
    parseUnits(String(initialSupply), decimals)
  );
  const predictedAddress = await portalClient.request(
    CreateCryptoCurrencyPredictAddress,
    {
      address: CRYPTO_CURRENCY_FACTORY_ADDRESS,
      sender: user.wallet,
      decimals,
      name: assetName,
      symbol,
      initialSupply: initialSupplyExact,
    }
  );

  const newAddress =
    predictedAddress.CryptoCurrencyFactory?.predictAddress?.predicted;

  if (!newAddress) {
    throw new Error("Failed to predict the address");
  }

  const isDeployed = await portalClient.request(IsAddressDeployed, {
    address: CRYPTO_CURRENCY_FACTORY_ADDRESS,
    predicted: newAddress,
  });

  return isDeployed.CryptoCurrencyFactory?.isAddressDeployed;
};

"use server";

import { getUser } from "@/lib/auth/utils";
import { CRYPTO_CURRENCY_FACTORY_ADDRESS } from "@/lib/contracts";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { parseUnits } from "viem";
import { type CryptoCurrencyInput } from "./create-schema";
import { CreateCryptoCurrencyPredictAddress } from "./predict-address";

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

export const isAddressDeployed = async (data: CryptoCurrencyInput) => {
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

  const isDeployed = await portalClient.request(IsAddressDeployed, {
    address: CRYPTO_CURRENCY_FACTORY_ADDRESS,
    predicted: address,
  });

  return isDeployed.CryptoCurrencyFactory?.isAddressDeployed;
};

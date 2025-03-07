"use server";
import { getUser } from "@/lib/auth/utils";
import { STABLE_COIN_FACTORY_ADDRESS } from "@/lib/contracts";
import type { CreateStablecoinInput } from "@/lib/mutations/stablecoin/create/create-schema";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import type { Address } from "viem";

/**
 * GraphQL query for predicting the address of a new stablecoin
 *
 * @remarks
 * Uses deterministic deployment to predict the contract address before creation
 */
const CreateStablecoinPredictAddress = portalGraphql(`
  query CreateStablecoinPredictAddress($address: String!, $sender: String!, $decimals: Int!, $name: String!, $symbol: String!, $collateralLivenessSeconds: Float!) {
    StableCoinFactory(address: $address) {
      predictAddress(
        sender: $sender
        decimals: $decimals
        collateralLivenessSeconds: $collateralLivenessSeconds
        name: $name
        symbol: $symbol
      ) {
        predicted
      }
    }
  }
`);

export const getPredictedAddress = async (data: CreateStablecoinInput) => {
  const { assetName, symbol, decimals, collateralLivenessSeconds } = data;
  const user = await getUser("en");

  const predictedAddress = await portalClient.request(
    CreateStablecoinPredictAddress,
    {
      address: STABLE_COIN_FACTORY_ADDRESS,
      sender: user.wallet,
      decimals,
      collateralLivenessSeconds,
      name: assetName,
      symbol,
    }
  );

  const address = predictedAddress.StableCoinFactory?.predictAddress?.predicted;
  if (!address) {
    throw new Error("Failed to predict the address");
  }

  return address as Address;
};

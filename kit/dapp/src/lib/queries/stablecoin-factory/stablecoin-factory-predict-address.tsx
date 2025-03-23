"use server";
import { getUser } from "@/lib/auth/utils";
import { STABLE_COIN_FACTORY_ADDRESS } from "@/lib/contracts";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { getTimeUnitSeconds } from "@/lib/utils/date";
import { safeParse } from "@/lib/utils/typebox";
import { cache } from "react";
import type { Address } from "viem";
import {
  PredictedAddressSchema,
  type PredictAddressInput,
} from "./stablecoin-factory-schema";

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

/**
 * Predicts the address of a new stablecoin
 *
 * @param input - The data for creating a new stablecoin
 * @returns The predicted address of the new stablecoin
 */
export const getPredictedAddress = cache(async (input: PredictAddressInput) => {
  const {
    assetName,
    symbol,
    decimals,
    collateralLivenessValue,
    collateralLivenessTimeUnit,
  } = input;
  const user = await getUser();

  const collateralLivenessSeconds =
    collateralLivenessValue * getTimeUnitSeconds(collateralLivenessTimeUnit);

  const data = await portalClient.request(CreateStablecoinPredictAddress, {
    address: STABLE_COIN_FACTORY_ADDRESS,
    sender: user.wallet as Address,
    decimals,
    name: assetName,
    symbol,
    collateralLivenessSeconds,
  });

  const predictedAddress = safeParse(PredictedAddressSchema, data);

  return predictedAddress.StableCoinFactory.predictAddress.predicted;
});

"use server";
import { getUser } from "@/lib/auth/utils";
import { STABLE_COIN_FACTORY_ADDRESS } from "@/lib/contracts";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { getTimeUnitSeconds } from "@/lib/utils/date";
import { withTracing } from "@/lib/utils/sentry-tracing";
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
export const getPredictedAddress = withTracing(
  "queries",
  "getPredictedAddress",
  async (input: PredictAddressInput) => {
    const user = await getUser();
    return getPredictedAddressForUser(input, user.wallet);
  }
);

export const getPredictedAddressForUser = withTracing(
  "queries",
  "getPredictedAddressForUser",
  cache(async (input: PredictAddressInput, userAddress: Address) => {
    const {
      assetName,
      symbol,
      decimals,
      collateralLivenessValue,
      collateralLivenessTimeUnit,
    } = input;

    const collateralLivenessSeconds = getTimeUnitSeconds(
      collateralLivenessValue,
      collateralLivenessTimeUnit
    );

    const data = await portalClient.request(CreateStablecoinPredictAddress, {
      address: STABLE_COIN_FACTORY_ADDRESS,
      sender: userAddress,
      decimals,
      name: assetName,
      symbol,
      collateralLivenessSeconds,
    });

    const predictedAddress = safeParse(PredictedAddressSchema, data);

    return predictedAddress.StableCoinFactory.predictAddress.predicted;
  })
);

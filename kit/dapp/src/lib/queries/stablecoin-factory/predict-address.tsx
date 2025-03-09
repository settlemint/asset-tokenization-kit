"use server";
import { getUser } from "@/lib/auth/utils";
import { STABLE_COIN_FACTORY_ADDRESS } from "@/lib/contracts";
import type { CreateStablecoinInput } from "@/lib/mutations/stablecoin/create/create-schema";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParseWithLogging, z } from "@/lib/utils/zod";
import { cache } from "react";
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

const PredictedAddressSchema = z.object({
  StableCoinFactory: z.object({
    predictAddress: z.object({
      predicted: z.address(),
    }),
  }),
});

/**
 * Predicts the address of a new stablecoin
 *
 * @param input - The data for creating a new stablecoin
 * @returns The predicted address of the new stablecoin
 */
export const getPredictedAddress = cache(
  async (input: CreateStablecoinInput) => {
    const { assetName, symbol, decimals, collateralLivenessSeconds } = input;
    const user = await getUser();

    const data = await portalClient.request(CreateStablecoinPredictAddress, {
      address: STABLE_COIN_FACTORY_ADDRESS,
      sender: user.wallet as Address,
      decimals,
      collateralLivenessSeconds,
      name: assetName,
      symbol,
    });

    const predictedAddress = safeParseWithLogging(
      PredictedAddressSchema,
      data,
      "stablecoin"
    );

    return predictedAddress.StableCoinFactory.predictAddress.predicted;
  }
);

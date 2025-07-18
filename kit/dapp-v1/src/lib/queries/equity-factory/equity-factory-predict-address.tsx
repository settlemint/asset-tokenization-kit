"use server";
import { getUser } from "@/lib/auth/utils";
import { EQUITY_FACTORY_ADDRESS } from "@/lib/contracts";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withTracing } from "@/lib/utils/sentry-tracing";
import { safeParse } from "@/lib/utils/typebox";
import { cache } from "react";
import type { Address } from "viem";
import {
  PredictedAddressSchema,
  type PredictAddressInput,
} from "./equity-factory-schema";

/**
 * GraphQL query for predicting the address of a new equity
 *
 * @remarks
 * Uses deterministic deployment to predict the contract address before creation
 */
const CreateEquityPredictAddress = portalGraphql(`
  query CreateEquityPredictAddress($address: String!, $sender: String!, $decimals: Int!, $name: String!, $symbol: String!, $equityCategory: String!, $equityClass: String!) {
    EquityFactory(address: $address) {
      predictAddress(
        sender: $sender
        decimals: $decimals
        name: $name
        symbol: $symbol
        equityCategory: $equityCategory
        equityClass: $equityClass
      ) {
        predicted
      }
    }
  }
`);

/**
 * Predicts the address of a new equity
 *
 * @param input - The data for creating a new equity
 * @returns The predicted address of the new equity
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
    const { assetName, symbol, decimals, equityCategory, equityClass } = input;

    const data = await portalClient.request(CreateEquityPredictAddress, {
      address: EQUITY_FACTORY_ADDRESS,
      sender: userAddress,
      decimals,
      name: assetName,
      symbol,
      equityCategory,
      equityClass,
    });

    const predictedAddress = safeParse(PredictedAddressSchema, data);

    return predictedAddress.EquityFactory.predictAddress.predicted;
  })
);

"use server";
import { getUser } from "@/lib/auth/utils";
import { FUND_FACTORY_ADDRESS } from "@/lib/contracts";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse } from "@/lib/utils/typebox";
import { cache } from "react";
import type { Address } from "viem";
import {
  PredictedAddressSchema,
  type PredictAddressInput,
} from "./fund-factory-schema";

/**
 * GraphQL query for predicting the address of a new fund
 *
 * @remarks
 * Uses deterministic deployment to predict the contract address before creation
 */
const CreateFundPredictAddress = portalGraphql(`
  query CreateFundPredictAddress($address: String!, $sender: String!, $decimals: Int!, $name: String!, $symbol: String!, $fundCategory: String!, $fundClass: String!, $managementFeeBps: Int!) {
    FundFactory(address: $address) {
      predictAddress(
        sender: $sender
        decimals: $decimals
        name: $name
        symbol: $symbol
        fundCategory: $fundCategory
        fundClass: $fundClass
        managementFeeBps: $managementFeeBps
      ) {
        predicted
      }
    }
  }
`);

/**
 * Predicts the address of a new fund
 *
 * @param input - The data for creating a new fund
 * @returns The predicted address of the new fund
 */
export const getPredictedAddress = cache(async (input: PredictAddressInput) => {
  const {
    assetName,
    symbol,
    decimals,
    fundCategory,
    fundClass,
    managementFeeBps,
  } = input;
  const user = await getUser();

  const data = await portalClient.request(CreateFundPredictAddress, {
    address: FUND_FACTORY_ADDRESS,
    sender: user.wallet as Address,
    decimals,
    name: assetName,
    symbol,
    fundCategory,
    fundClass,
    managementFeeBps,
  });

  const predictedAddress = safeParse(PredictedAddressSchema, data);

  return predictedAddress.FundFactory.predictAddress.predicted;
});

"use server";
import { getUser } from "@/lib/auth/utils";
import { FUND_FACTORY_ADDRESS } from "@/lib/contracts";
import type { CreateFundInput } from "@/lib/mutations/fund/create/create-schema";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParseWithLogging, z } from "@/lib/utils/zod";
import { cache } from "react";
import type { Address } from "viem";

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

const PredictedAddressSchema = z.object({
  FundFactory: z.object({
    predictAddress: z.object({
      predicted: z.address(),
    }),
  }),
});

/**
 * Predicts the address of a new fund
 *
 * @param input - The data for creating a new fund
 * @returns The predicted address of the new fund
 */
export const getPredictedAddress = cache(async (input: CreateFundInput) => {
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

  const predictedAddress = safeParseWithLogging(
    PredictedAddressSchema,
    data,
    "fund"
  );

  return predictedAddress.FundFactory.predictAddress.predicted;
});

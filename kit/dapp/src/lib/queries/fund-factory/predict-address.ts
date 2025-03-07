"use server";
import { getUser } from "@/lib/auth/utils";
import { FUND_FACTORY_ADDRESS } from "@/lib/contracts";
import type { CreateFundInput } from "@/lib/mutations/fund/create/create-schema";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
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

export const getPredictedAddress = async (data: CreateFundInput) => {
  const {
    assetName,
    symbol,
    decimals,
    fundCategory,
    fundClass,
    managementFeeBps,
  } = data;

  const user = await getUser("en");

  const predictedAddress = await portalClient.request(
    CreateFundPredictAddress,
    {
      address: FUND_FACTORY_ADDRESS,
      sender: user.wallet,
      decimals,
      name: assetName,
      symbol,
      fundCategory,
      fundClass,
      managementFeeBps,
    }
  );

  const address = predictedAddress.FundFactory?.predictAddress?.predicted;
  if (!address) {
    throw new Error("Failed to predict the address");
  }

  return address as Address;
};

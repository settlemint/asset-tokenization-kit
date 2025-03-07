"use server";
import { getUser } from "@/lib/auth/utils";
import { EQUITY_FACTORY_ADDRESS } from "@/lib/contracts";
import type { CreateEquityInput } from "@/lib/mutations/equity/create/create-schema";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import type { Address } from "viem";

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

export const getPredictedAddress = async (data: CreateEquityInput) => {
  const { assetName, symbol, decimals, equityCategory, equityClass } = data;

  const user = await getUser("en");

  const predictedAddress = await portalClient.request(
    CreateEquityPredictAddress,
    {
      address: EQUITY_FACTORY_ADDRESS,
      sender: user.wallet,
      decimals,
      name: assetName,
      symbol,
      equityCategory,
      equityClass,
    }
  );

  const address = predictedAddress.EquityFactory?.predictAddress?.predicted;
  if (!address) {
    throw new Error("Failed to predict the address");
  }

  return address as Address;
};

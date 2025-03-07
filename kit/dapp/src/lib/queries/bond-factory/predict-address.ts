"use server";
import { getUser } from "@/lib/auth/utils";
import { BOND_FACTORY_ADDRESS } from "@/lib/contracts";
import type { CreateBondInput } from "@/lib/mutations/bond/create/create-schema";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { formatDate } from "@/lib/utils/date";
import { parseUnits, type Address } from "viem";

/**
 * GraphQL query for predicting the address of a new bond
 *
 * @remarks
 * Uses deterministic deployment to predict the contract address before creation
 */
const CreateBondPredictAddress = portalGraphql(`
  query CreateBondPredictAddress($address: String!, $sender: String!, $decimals: Int!, $name: String!, $symbol: String!, $cap: String!, $faceValue: String!, $maturityDate: String!, $underlyingAsset: String!) {
    BondFactory(address: $address) {
      predictAddress(
        sender: $sender
        decimals: $decimals
        name: $name
        symbol: $symbol
        cap: $cap
        faceValue: $faceValue
        maturityDate: $maturityDate
        underlyingAsset: $underlyingAsset
      ) {
        predicted
      }
    }
  }
`);

export const getPredictedAddress = async (data: CreateBondInput) => {
  const user = await getUser("en");
  const {
    assetName,
    symbol,
    decimals,
    cap,
    faceValue,
    maturityDate,
    underlyingAsset,
  } = data;

  const capExact = String(parseUnits(String(cap), decimals));
  const maturityDateTimestamp = formatDate(maturityDate, {
    type: "unixSeconds",
  });

  const predictedAddress = await portalClient.request(
    CreateBondPredictAddress,
    {
      address: BOND_FACTORY_ADDRESS,
      sender: user.wallet,
      decimals,
      cap: capExact,
      faceValue: String(faceValue),
      maturityDate: maturityDateTimestamp,
      underlyingAsset,
      name: assetName,
      symbol,
    }
  );

  const address = predictedAddress.BondFactory?.predictAddress?.predicted;
  if (!address) {
    throw new Error("Failed to predict the address");
  }

  return address as Address;
};

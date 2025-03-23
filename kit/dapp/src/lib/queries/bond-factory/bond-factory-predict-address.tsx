"use server";
import { getUser } from "@/lib/auth/utils";
import { BOND_FACTORY_ADDRESS } from "@/lib/contracts";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { formatDate } from "@/lib/utils/date";
import { safeParse } from "@/lib/utils/typebox";
import { cache } from "react";
import { parseUnits, type Address } from "viem";
import {
  PredictedAddressSchema,
  type PredictAddressInput,
} from "./bond-factory-schema";

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

/**
 * Predicts the address of a new bond
 *
 * @param input - The data for creating a new bond
 * @returns The predicted address of the new bond
 */
export const getPredictedAddress = cache(async (input: PredictAddressInput) => {
  const {
    assetName,
    symbol,
    decimals,
    cap,
    faceValue,
    maturityDate,
    underlyingAsset,
  } = input;
  const user = await getUser();

  const capExact = String(parseUnits(String(cap), decimals));
  const maturityDateTimestamp = formatDate(maturityDate, {
    type: "unixSeconds",
    locale: "en",
  });

  const data = await portalClient.request(CreateBondPredictAddress, {
    address: BOND_FACTORY_ADDRESS,
    sender: user.wallet as Address,
    decimals,
    name: assetName,
    symbol,
    cap: capExact,
    faceValue: String(faceValue),
    maturityDate: maturityDateTimestamp,
    underlyingAsset: underlyingAsset.id,
  });

  const predictedAddress = safeParse(PredictedAddressSchema, data);

  return predictedAddress.BondFactory.predictAddress.predicted;
});

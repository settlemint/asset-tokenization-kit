"use server";
import { getUser } from "@/lib/auth/utils";
import { BOND_FACTORY_ADDRESS } from "@/lib/contracts";
import type { CreateBondInput } from "@/lib/mutations/bond/create/create-schema";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { formatDate } from "@/lib/utils/date";
import { safeParseWithLogging, z } from "@/lib/utils/zod";
import { cache } from "react";
import { type Address, parseUnits } from "viem";

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

const PredictedAddressSchema = z.object({
  BondFactory: z.object({
    predictAddress: z.object({
      predicted: z.address(),
    }),
  }),
});

/**
 * Predicts the address of a new bond
 *
 * @param data - The data for creating a new bond
 * @returns The predicted address of the new bond
 */
export const getPredictedAddress = cache(async (input: CreateBondInput) => {
  const user = await getUser();
  const {
    assetName,
    symbol,
    decimals,
    cap,
    faceValue,
    maturityDate,
    underlyingAsset,
  } = input;

  const capExact = String(parseUnits(String(cap), decimals));
  const maturityDateTimestamp = formatDate(maturityDate, {
    type: "unixSeconds",
  });

  const data = await portalClient.request(CreateBondPredictAddress, {
    address: BOND_FACTORY_ADDRESS,
    sender: user.wallet as Address,
    decimals,
    cap: capExact,
    faceValue: String(faceValue),
    maturityDate: maturityDateTimestamp,
    underlyingAsset,
    name: assetName,
    symbol,
  });

  const predictedAddress = safeParseWithLogging(
    PredictedAddressSchema,
    data,
    "bond"
  );

  return predictedAddress.BondFactory.predictAddress.predicted;
});

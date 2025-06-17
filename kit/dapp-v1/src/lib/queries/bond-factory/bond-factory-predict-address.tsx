"use server";
import { getUser } from "@/lib/auth/utils";
import { BOND_FACTORY_ADDRESS } from "@/lib/contracts";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { formatDate } from "@/lib/utils/date";
import { withTracing } from "@/lib/utils/sentry-tracing";
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
      cap,
      faceValue,
      maturityDate,
      underlyingAsset,
    } = input;

    const capExact = String(parseUnits(String(cap), decimals));
    const maturityDateTimestamp = formatDate(maturityDate, {
      type: "unixSeconds",
      locale: "en",
    });

    // Add timeout for the request
    const timeoutPromise = new Promise<null>((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out")), 10000); // 10 second timeout
    });

    // Race the actual request against the timeout
    const data = await Promise.race([
      portalClient.request(CreateBondPredictAddress, {
        address: BOND_FACTORY_ADDRESS,
        sender: userAddress,
        decimals,
        name: assetName,
        symbol,
        cap: capExact,
        faceValue: String(faceValue),
        maturityDate: maturityDateTimestamp,
        underlyingAsset: underlyingAsset.id,
      }),
      timeoutPromise,
    ]);

    if (!data) throw new Error("No data returned from prediction");

    const predictedAddress = safeParse(PredictedAddressSchema, data);
    return predictedAddress.BondFactory.predictAddress.predicted;
  })
);

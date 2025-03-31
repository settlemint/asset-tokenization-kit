"use server";

import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { safeParse } from "@/lib/utils/typebox";
import type { Address } from "viem";
import { CryptocurrencyExistsSchema } from "./cryptocurrency-factory-schema";

/**
 * GraphQL query for checking if an address is deployed
 *
 * @remarks
 * Checks if a token address is already deployed through the cryptocurrency factory
 */
const CryptocurrencyExists = theGraphGraphqlKit(`
  query CryptocurrencyExists($token: ID!) {
    cryptoCurrency(id: $token) {
      id
    }
  }
`);

export const isAddressAvailable = async (address: Address) => {
  try {
    console.log(`Checking if address ${address} is available...`);

    const data = await theGraphClientKit.request(CryptocurrencyExists, {
      token: address,
    });

    console.log(
      "CryptocurrencyExists response:",
      JSON.stringify(data, null, 2)
    );

    const cryptocurrencyExists = safeParse(CryptocurrencyExistsSchema, data);

    // Log the exact parsed result for debugging
    console.log(
      "Parsed result:",
      JSON.stringify(cryptocurrencyExists, null, 2)
    );

    // A duplicate exists if cryptocurrencyExists.cryptoCurrency is not null or undefined
    const isDuplicate = !!cryptocurrencyExists.cryptoCurrency?.id;

    console.log(
      `Address ${address} is ${isDuplicate ? "NOT" : ""} available. isDuplicate=${isDuplicate}`
    );

    // Return true if it's available (not a duplicate), false if unavailable (is a duplicate)
    return !isDuplicate;
  } catch (error) {
    // Log the error but don't fail validation
    console.error("Error checking if address is available:", error);
    console.log("Defaulting to assuming address is unavailable for safety");
    // In case of error, assume it's unavailable to be safe
    return false;
  }
};

"use server";

import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { safeParse } from "@/lib/utils/typebox";
import { cache } from "react";
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

export const isAddressAvailable = cache(async (address: Address) => {
  const data = await theGraphClientKit.request(CryptocurrencyExists, {
    token: address,
  });

  const cryptocurrencyExists = safeParse(CryptocurrencyExistsSchema, data);

  return !cryptocurrencyExists.cryptocurrency;
});

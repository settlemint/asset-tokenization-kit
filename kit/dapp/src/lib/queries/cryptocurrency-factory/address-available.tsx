"use server";

import { theGraphClient, theGraphGraphql } from "@/lib/settlemint/the-graph";
import { safeParseWithLogging, z } from "@/lib/utils/zod";
import { cache } from "react";
import type { Address } from "viem";

/**
 * GraphQL query for checking if an address is deployed
 *
 * @remarks
 * Checks if a token address is already deployed through the cryptocurrency factory
 */
const CryptoCurrencyExists = theGraphGraphql(`
  query CryptoCurrencyExists($token: ID!) {
    cryptoCurrency(id: $token) {
      id
    }
  }
`);

const CryptoCurrencyExistsSchema = z.object({
  cryptoCurrency: z
    .object({
      id: z.string(),
    })
    .nullish(),
});

export const isAddressAvailable = cache(async (address: Address) => {
  const data = await theGraphClient.request(CryptoCurrencyExists, {
    token: address,
  });

  const cryptoCurrencyExists = safeParseWithLogging(
    CryptoCurrencyExistsSchema,
    data,
    "cryptocurrency factory"
  );

  return !cryptoCurrencyExists.cryptoCurrency;
});

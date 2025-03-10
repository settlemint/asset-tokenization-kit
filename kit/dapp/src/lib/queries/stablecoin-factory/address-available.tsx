"use server";

import { theGraphClient, theGraphGraphql } from "@/lib/settlemint/the-graph";
import { safeParseWithLogging, z } from "@/lib/utils/zod";
import { cache } from "react";
import type { Address } from "viem";

/**
 * GraphQL query for checking if an address is deployed
 *
 * @remarks
 * Checks if a token address is already deployed through the stablecoin factory
 */
const StableCoinExists = theGraphGraphql(`
  query StableCoinExists($token: ID!) {
    stableCoin(id: $token) {
      id
    }
  }
`);

const StableCoinExistsSchema = z.object({
  stableCoin: z
    .object({
      id: z.string(),
    })
    .nullish(),
});

export const isAddressAvailable = cache(async (address: Address) => {
  const data = await theGraphClient.request(StableCoinExists, {
    token: address,
  });

  const stableCoinExists = safeParseWithLogging(
    StableCoinExistsSchema,
    data,
    "stablecoin factory"
  );

  return !stableCoinExists.stableCoin;
});

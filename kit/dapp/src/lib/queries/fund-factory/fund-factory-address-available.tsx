"use server";

import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { safeParse } from "@/lib/utils/typebox";
import { cache } from "react";
import type { Address } from "viem";
import { FundExistsSchema } from "./fund-factory-schema";

/**
 * GraphQL query for checking if an address is deployed
 *
 * @remarks
 * Checks if a token address is already deployed through the fund factory
 */
const FundExists = theGraphGraphqlKit(`
  query FundExists($token: ID!) {
    fund(id: $token) {
      id
    }
  }
`);

export const isAddressAvailable = cache(async (address: Address) => {
  const data = await theGraphClientKit.request(FundExists, {
    token: address,
  });

  const fundExists = safeParse(FundExistsSchema, data);

  return !fundExists?.fund;
});

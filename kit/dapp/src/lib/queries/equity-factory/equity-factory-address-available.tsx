"use server";

import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { safeParse } from "@/lib/utils/typebox";
import { cache } from "react";
import type { Address } from "viem";
import { EquityExistsSchema } from "./equity-factory-schema";

/**
 * GraphQL query for checking if an address is deployed
 *
 * @remarks
 * Checks if a token address is already deployed through the equity factory
 */
const EquityExists = theGraphGraphqlKit(`
  query EquityExists($token: ID!) {
    equity(id: $token) {
      id
    }
  }
`);

export const isAddressAvailable = cache(async (address: Address) => {
  const data = await theGraphClientKit.request(EquityExists, {
    token: address,
  });

  const equityExists = safeParse(EquityExistsSchema, data);

  return !equityExists.equity;
});

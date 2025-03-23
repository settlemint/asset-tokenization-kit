"use server";

import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { safeParse } from "@/lib/utils/typebox";
import { cache } from "react";
import type { Address } from "viem";
import { BondExistsSchema } from "./bond-factory-schema";

/**
 * GraphQL query for checking if an address is deployed
 *
 * @remarks
 * Checks if a token address is already deployed through the bond factory
 */
const BondExists = theGraphGraphqlKit(`
  query BondExists($token: ID!) {
    bond(id: $token) {
      id
    }
  }
`);

export const isAddressAvailable = cache(async (address: Address) => {
  const data = await theGraphClientKit.request(BondExists, {
    token: address,
  });

  const bondExists = safeParse(BondExistsSchema, data);

  return !bondExists.bond;
});

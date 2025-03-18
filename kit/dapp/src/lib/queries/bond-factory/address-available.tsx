"use server";

import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { safeParseWithLogging, z } from "@/lib/utils/zod";
import { cache } from "react";
import type { Address } from "viem";

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

const BondExistsSchema = z.object({
  bond: z
    .object({
      id: z.string(),
    })
    .nullish(),
});

export const isAddressAvailable = cache(async (address: Address) => {
  const data = await theGraphClientKit.request(BondExists, {
    token: address,
  });

  const bondExists = safeParseWithLogging(
    BondExistsSchema,
    data,
    "bond factory"
  );

  return !bondExists.bond;
});

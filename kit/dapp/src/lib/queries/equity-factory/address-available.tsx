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
 * Checks if a token address is already deployed through the equity factory
 */
const EquityExists = theGraphGraphqlKit(`
  query EquityExists($token: ID!) {
    equity(id: $token) {
      id
    }
  }
`);

const EquityExistsSchema = z.object({
  equity: z
    .object({
      id: z.string(),
    })
    .nullish(),
});

export const isAddressAvailable = cache(async (address: Address) => {
  const data = await theGraphClientKit.request(EquityExists, {
    token: address,
  });

  const equityExists = safeParseWithLogging(
    EquityExistsSchema,
    data,
    "equity factory"
  );

  return !equityExists.equity;
});

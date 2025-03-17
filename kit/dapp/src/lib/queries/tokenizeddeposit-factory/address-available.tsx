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
 * Checks if a token address is already deployed through the stablecoin factory
 */
const TokenizedDepositExists = theGraphGraphqlKit(`
  query TokenizedDepositExists($token: ID!) {
    tokenizedDeposit(id: $token) {
      id
    }
  }
`);

const TokenizedDepositExistsSchema = z.object({
  tokenizedDeposit: z
    .object({
      id: z.string(),
    })
    .nullish(),
});

export const isAddressAvailable = cache(async (address: Address) => {
  const data = await theGraphClientKit.request(TokenizedDepositExists, {
    token: address,
  });

  const tokenizedDepositExists = safeParseWithLogging(
    TokenizedDepositExistsSchema,
    data,
    "tokenized deposit factory"
  );

  return !tokenizedDepositExists.tokenizedDeposit;
});

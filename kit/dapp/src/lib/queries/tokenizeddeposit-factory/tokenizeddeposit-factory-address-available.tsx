"use server";

import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { safeParse } from "@/lib/utils/typebox";
import { cache } from "react";
import type { Address } from "viem";
import { TokenizedDepositExistsSchema } from "./tokenizeddeposit-factory-schema";

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

export const isAddressAvailable = cache(async (address: Address) => {
  const data = await theGraphClientKit.request(TokenizedDepositExists, {
    token: address,
  });

  const tokenizedDepositExists = safeParse(TokenizedDepositExistsSchema, data);

  return !tokenizedDepositExists.tokenizedDeposit;
});

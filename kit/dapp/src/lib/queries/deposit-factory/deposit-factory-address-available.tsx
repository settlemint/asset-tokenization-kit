"use server";

import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import type { Address } from "viem";
import { DepositExistsSchema } from "./deposit-factory-schema";

/**
 * GraphQL query for checking if an address is deployed
 *
 * @remarks
 * Checks if a token address is already deployed through the stablecoin factory
 */
const DepositExists = theGraphGraphqlKit(`
  query DepositExists($token: ID!) {
    deposit(id: $token) {
      id
    }
  }
`);

export const isAddressAvailable = withTracing(
  "queries",
  "isAddressAvailable",
  async (address: Address) => {
    "use cache";
    cacheTag("asset");
    const data = await theGraphClientKit.request(DepositExists, {
      token: address,
    });

    const depositExists = safeParse(DepositExistsSchema, data);

    return !depositExists.deposit;
  }
);

"use server";

import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import type { Address } from "viem";
import { StableCoinExistsSchema } from "./stablecoin-factory-schema";

/**
 * GraphQL query for checking if an address is deployed
 *
 * @remarks
 * Checks if a token address is already deployed through the stablecoin factory
 */
const StableCoinExists = theGraphGraphqlKit(`
  query StableCoinExists($token: ID!) {
    stableCoin(id: $token) {
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
    const data = await theGraphClientKit.request(StableCoinExists, {
      token: address,
    });

    const stableCoinExists = safeParse(StableCoinExistsSchema, data);

    return !stableCoinExists.stableCoin;
  }
);

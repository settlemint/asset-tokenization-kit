"use server";

import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/sentry-tracing";
import { safeParse } from "@/lib/utils/typebox";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
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

export const isAddressAvailable = withTracing(
  "queries",
  "isAddressAvailable",
  async (address: Address) => {
    "use cache";
    cacheTag("asset");
    const data = await theGraphClientKit.request(EquityExists, {
      token: address,
    });

    const equityExists = safeParse(EquityExistsSchema, data);

    return !equityExists.equity;
  }
);

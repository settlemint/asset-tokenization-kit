"use server";

import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/sentry-tracing";
import { safeParse } from "@/lib/utils/typebox";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
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

export const isAddressAvailable = withTracing(
  "queries",
  "isAddressAvailable",
  async (address: Address) => {
    "use cache";
    cacheTag("asset");
    const data = await theGraphClientKit.request(FundExists, {
      token: address,
    });

    const fundExists = safeParse(FundExistsSchema, data);

    return !fundExists.fund;
  }
);

"use server";

import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import type { Address } from "viem";
import { StandardAirdropExistsSchema } from "./schema";

/**
 * GraphQL query for checking if a standard airdrop address is deployed
 *
 * @remarks
 * Checks if a standard airdrop address is already deployed through the airdrop factory
 */
const StandardAirdropExists = theGraphGraphqlKit(`
  query StandardAirdropExists($airdropAddress: ID!) {
    standardAirdrop(id: $airdropAddress) {
      id
    }
  }
`);

export const isAddressAvailable = withTracing(
  "queries",
  "isAddressAvailable",
  async (address: Address) => {
    "use cache";
    cacheTag("airdrop");
    const data = await theGraphClientKit.request(StandardAirdropExists, {
      airdropAddress: address,
    });

    const standardAirdropExists = safeParse(StandardAirdropExistsSchema, data);

    return !standardAirdropExists.standardAirdrop;
  }
);

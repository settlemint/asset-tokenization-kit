"use server";

import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/sentry-tracing";
import { safeParse } from "@/lib/utils/typebox";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import type { Address } from "viem";
import { PushAirdropExistsSchema } from "./schema";

/**
 * GraphQL query for checking if a push airdrop address is deployed
 *
 * @remarks
 * Checks if a push airdrop address is already deployed through the airdrop factory
 */
// const PushAirdropExists = theGraphGraphqlKit(`
//   query PushAirdropExists($airdropAddress: ID!) {
//     pushAirdrop(id: $airdropAddress) {
//       id
//     }
//   }
// `);

export const isAddressAvailable = withTracing(
  "queries",
  "isAddressAvailable",
  async (address: Address) => {
    "use cache";
    cacheTag("airdrop");
          //       // const data = await theGraphClientKit.request(PushAirdropExists, {
      //       //       airdropAddress: address,
      //       //     });
    // NOTE: HARDCODED SO IT STILL COMPILES
    const data = { pushAirdrop: null };

    const pushAirdropExists = safeParse(PushAirdropExistsSchema, data);

    return !pushAirdropExists.pushAirdrop;
  }
);

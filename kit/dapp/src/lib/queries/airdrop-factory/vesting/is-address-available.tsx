"use server";

import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/sentry-tracing";
import { safeParse } from "@/lib/utils/typebox";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import type { Address } from "viem";
import { VestingAirdropExistsSchema } from "./schema";

/**
 * GraphQL query for checking if a vesting airdrop address is deployed
 *
 * @remarks
 * Checks if a vesting airdrop address is already deployed through the airdrop factory
 */
// const VestingAirdropExists = theGraphGraphqlKit(`
//   query VestingAirdropExists($airdropAddress: ID!) {
//     vestingAirdrop(id: $airdropAddress) {
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
          //       // const data = await theGraphClientKit.request(VestingAirdropExists, {
      //       //       airdropAddress: address,
      //       //     });
    // NOTE: HARDCODED SO IT STILL COMPILES
    const data = { vestingAirdrop: null };

    const vestingAirdropExists = safeParse(VestingAirdropExistsSchema, data);

    return !vestingAirdropExists.vestingAirdrop;
  }
);

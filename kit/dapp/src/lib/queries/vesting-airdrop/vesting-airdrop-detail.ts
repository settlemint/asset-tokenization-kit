import "server-only";

import type { User } from "@/lib/auth/types";
import { getAssetsPricesInUserCurrency } from "@/lib/queries/asset-price/asset-price";
import { VestingAirdropSchema } from "@/lib/queries/vesting-airdrop/vesting-airdrop-schema";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox/index";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { cache } from "react";
import type { Address } from "viem";
import { getAddress } from "viem";
import { getAirdropDistribution } from "../airdrop/airdrop-distribution";
import { VestingAirdropFragment } from "./vesting-airdrop-fragment";

/**
 * GraphQL query to fetch on-chain vesting airdrop details from The Graph
 */
const VestingAirdropDetail = theGraphGraphqlKit(
  `
  query VestingAirdropDetail($id: ID!) {
    vestingAirdrop(id: $id) {
      ...VestingAirdropFragment
    }
  }
`,
  [VestingAirdropFragment]
);

/**
 * Fetches and combines on-chain and off-chain vesting airdrop data
 *
 * @param params - Object containing the vesting airdrop address
 * @returns Combined vesting airdrop data
 * @throws Error if fetching or parsing fails
 */
export const getVestingAirdropDetail = withTracing(
  "queries",
  "getVestingAirdropDetail",
  cache(async ({ address, user }: { address: Address; user: User }) => {
    "use cache";
    cacheTag("airdrop");

    const [onChainVestingAirdrop, distribution] = await Promise.all([
      (async () => {
        const response = await theGraphClientKit.request(
          VestingAirdropDetail,
          {
            id: address,
          },
          {
            "X-GraphQL-Operation-Name": "VestingAirdropDetail",
            "X-GraphQL-Operation-Type": "query",
          }
        );
        return response.vestingAirdrop;
      })(),
      getAirdropDistribution(address),
    ]);

    if (!onChainVestingAirdrop) {
      throw new Error(`Vesting airdrop not found for address ${address}`);
    }

    const prices = await getAssetsPricesInUserCurrency(
      [onChainVestingAirdrop.asset.id],
      user.currency
    );
    const price = prices.get(getAddress(onChainVestingAirdrop.asset.id));

    return safeParse(VestingAirdropSchema, {
      ...onChainVestingAirdrop,
      distribution,
      price,
    });
  })
);

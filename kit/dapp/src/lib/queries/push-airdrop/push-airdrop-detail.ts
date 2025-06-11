import "server-only";

import type { User } from "@/lib/auth/types";
import { getAssetsPricesInUserCurrency } from "@/lib/queries/asset-price/asset-price";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { cache } from "react";
import { getAddress, type Address } from "viem";
import { getAirdropDistribution } from "../airdrop/airdrop-distribution";
import { getAssetBalanceDetail } from "../asset-balance/asset-balance-detail";
import { PushAirdropFragment } from "./push-airdrop-fragment";
import { PushAirdropSchema, type PushAirdrop } from "./push-airdrop-schema";

/**
 * GraphQL query to fetch on-chain push airdrop details from The Graph
 */
const PushAirdropDetail = theGraphGraphqlKit(
  `
  query PushAirdropDetail($id: ID!) {
    pushAirdrop(id: $id) {
      ...PushAirdropFragment
    }
  }
`,
  [PushAirdropFragment]
);

/**
 * Fetches and combines on-chain and off-chain push airdrop data
 *
 * @param params - Object containing the push airdrop address
 * @returns Combined push airdrop data
 * @throws Error if fetching or parsing fails
 */
export const getPushAirdropDetail = withTracing(
  "queries",
  "getPushAirdropDetail",
  cache(
    async ({
      address,
      user,
    }: {
      address: Address;
      user: User;
    }): Promise<PushAirdrop> => {
      "use cache";
      cacheTag("airdrop");

      const [onChainPushAirdrop, distribution] = await Promise.all([
        (async () => {
          const response = await theGraphClientKit.request(
            PushAirdropDetail,
            {
              id: address,
            },
            {
              "X-GraphQL-Operation-Name": "PushAirdropDetail",
              "X-GraphQL-Operation-Type": "query",
            }
          );
          return response.pushAirdrop;
        })(),
        getAirdropDistribution(address),
      ]);

      if (!onChainPushAirdrop) {
        throw new Error(`Push airdrop not found for address ${address}`);
      }

      const balance = await getAssetBalanceDetail({
        address: getAddress(onChainPushAirdrop.asset.id),
        account: address,
      });

      const prices = await getAssetsPricesInUserCurrency(
        [onChainPushAirdrop.asset.id],
        user.currency
      );

      return safeParse(PushAirdropSchema, {
        ...onChainPushAirdrop,
        distribution,
        price: prices.get(getAddress(onChainPushAirdrop.asset.id)),
        balance: balance?.value ?? 0,
      });
    }
  )
);

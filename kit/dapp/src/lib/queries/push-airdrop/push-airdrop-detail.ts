import "server-only";

import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox/index";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { cache } from "react";
import type { Address } from "viem";
import { getAirdropDistribution } from "../airdrop/airdrop-distribution";
import { PushAirdropFragment } from "./push-airdrop-fragment";
import {
  OnChainPushAirdropSchema,
  type PushAirdrop,
} from "./push-airdrop-schema";

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
 * Props interface for push airdrop detail components
 */
export interface PushAirdropDetailProps {
  /** Ethereum address of the push airdrop contract */
  address: Address;
}

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
  cache(async ({ address }: PushAirdropDetailProps): Promise<PushAirdrop> => {
    "use cache";
    cacheTag("airdrop");

    const [onChainPushAirdrop, offChainPushAirdrop] = await Promise.all([
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
        return safeParse(OnChainPushAirdropSchema, response.pushAirdrop);
      })(),
      (async () => {
        const response = await getAirdropDistribution(address);
        return {
          distribution: response,
        };
      })(),
    ]);

    return {
      ...onChainPushAirdrop,
      ...offChainPushAirdrop,
    };
  })
);

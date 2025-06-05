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
import { VestingAirdropFragment } from "./vesting-airdrop-fragment";
import {
  OnChainVestingAirdropSchema,
  type VestingAirdrop,
} from "./vesting-airdrop-schema";

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
 * Props interface for vesting airdrop detail components
 */
export interface VestingAirdropDetailProps {
  /** Ethereum address of the vesting airdrop contract */
  address: Address;
}

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
  cache(
    async ({ address }: VestingAirdropDetailProps): Promise<VestingAirdrop> => {
      "use cache";
      cacheTag("airdrop");

      const [onChainVestingAirdrop, offChainVestingAirdrop] = await Promise.all(
        [
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
            return safeParse(
              OnChainVestingAirdropSchema,
              response.vestingAirdrop
            );
          })(),
          (async () => {
            const response = await getAirdropDistribution(address);
            return {
              distribution: response,
            };
          })(),
        ]
      );

      return {
        ...onChainVestingAirdrop,
        ...offChainVestingAirdrop,
      };
    }
  )
);

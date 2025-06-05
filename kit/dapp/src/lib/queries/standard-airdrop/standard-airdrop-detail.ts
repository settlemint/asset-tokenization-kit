import "server-only";

import { getAirdropDistribution } from "@/lib/queries/airdrop/airdrop-distribution";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox/index";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { cache } from "react";
import type { Address } from "viem";
import { StandardAirdropFragment } from "./standard-airdrop-fragment";
import {
  OnChainStandardAirdropSchema,
  type StandardAirdrop,
} from "./standard-airdrop-schema";

/**
 * GraphQL query to fetch on-chain standard airdrop details from The Graph
 */
const StandardAirdropDetail = theGraphGraphqlKit(
  `
  query StandardAirdropDetail($id: ID!) {
    standardAirdrop(id: $id) {
      ...StandardAirdropFragment
    }
  }
`,
  [StandardAirdropFragment]
);

/**
 * Props interface for standard airdrop detail components
 */
export interface StandardAirdropDetailProps {
  /** Ethereum address of the standard airdrop contract */
  address: Address;
}

/**
 * Fetches and combines on-chain and off-chain standard airdrop data
 *
 * @param params - Object containing the standard airdrop address
 * @returns Combined standard airdrop data
 * @throws Error if fetching or parsing fails
 */
export const getStandardAirdropDetail = withTracing(
  "queries",
  "getStandardAirdropDetail",
  cache(
    async ({
      address,
    }: StandardAirdropDetailProps): Promise<StandardAirdrop> => {
      "use cache";
      cacheTag("airdrop");

      const [onChainStandardAirdrop, offChainStandardAirdrop] =
        await Promise.all([
          (async () => {
            const response = await theGraphClientKit.request(
              StandardAirdropDetail,
              {
                id: address,
              },
              {
                "X-GraphQL-Operation-Name": "StandardAirdropDetail",
                "X-GraphQL-Operation-Type": "query",
              }
            );
            return safeParse(
              OnChainStandardAirdropSchema,
              response.standardAirdrop
            );
          })(),
          (async () => {
            const response = await getAirdropDistribution(address);
            return {
              distribution: response,
            };
          })(),
        ]);

      return {
        ...onChainStandardAirdrop,
        ...offChainStandardAirdrop,
      };
    }
  )
);

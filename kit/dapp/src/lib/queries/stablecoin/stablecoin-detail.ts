import "server-only";

import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { cache } from "react";
import { type Address, getAddress } from "viem";
import { stablecoinsCalculateFields } from "./stablecoin-calculated";
import {
  OffchainStableCoinFragment,
  StableCoinFragment,
} from "./stablecoin-fragment";
import {
  OffChainStableCoinSchema,
  OnChainStableCoinSchema,
} from "./stablecoin-schema";

/**
 * GraphQL query to fetch on-chain stablecoin details from The Graph
 */
const StableCoinDetail = theGraphGraphqlKit(
  `
  query StableCoinDetail($id: ID!) {
    stableCoin(id: $id) {
      ...StableCoinFragment
    }
  }
`,
  [StableCoinFragment]
);

/**
 * GraphQL query to fetch off-chain stablecoin details from Hasura
 */
const OffchainStableCoinDetail = hasuraGraphql(
  `
  query OffchainStableCoinDetail($id: String!) {
    asset(where: {id: {_eq: $id}}, limit: 1) {
      ...OffchainStableCoinFragment
    }
  }
`,
  [OffchainStableCoinFragment]
);

/**
 * Props interface for stablecoin detail components
 */
export interface StableCoinDetailProps {
  /** Ethereum address of the stablecoin contract */
  address: Address;
}

/**
 * Fetches and combines on-chain and off-chain stablecoin data
 *
 * @param params - Object containing the stablecoin address
 * @returns Combined stablecoin data with additional calculated metrics
 * @throws Error if fetching or parsing fails
 */
export const getStableCoinDetail = withTracing(
  "queries",
  "getStableCoinDetail",
  cache(async ({ address }: StableCoinDetailProps) => {
    "use cache";
    cacheTag("asset");
    const [onChainStableCoin, offChainStableCoin] = await Promise.all([
      (async () => {
        const response = await theGraphClientKit.request(
          StableCoinDetail,
          {
            id: address,
          },
          {
            "X-GraphQL-Operation-Name": "StableCoinDetail",
            "X-GraphQL-Operation-Type": "query",
          }
        );
        if (!response.stableCoin) {
          throw new Error("StableCoin not found");
        }
        return safeParse(OnChainStableCoinSchema, response.stableCoin);
      })(),
      (async () => {
        const response = await hasuraClient.request(
          OffchainStableCoinDetail,
          {
            id: getAddress(address),
          },
          {
            "X-GraphQL-Operation-Name": "OffchainStableCoinDetail",
            "X-GraphQL-Operation-Type": "query",
          }
        );
        if (response.asset.length === 0) {
          return undefined;
        }
        return safeParse(OffChainStableCoinSchema, response.asset[0]);
      })(),
    ]);

    const calculatedFields = await stablecoinsCalculateFields(
      [onChainStableCoin],
      [offChainStableCoin]
    );
    const calculatedStableCoin = calculatedFields.get(onChainStableCoin.id)!;

    return {
      ...onChainStableCoin,
      ...offChainStableCoin,
      ...calculatedStableCoin,
    };
  })
);

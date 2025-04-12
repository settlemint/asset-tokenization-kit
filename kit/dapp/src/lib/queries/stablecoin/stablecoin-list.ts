import "server-only";

import { fetchAllHasuraPages, fetchAllTheGraphPages } from "@/lib/pagination";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse, t } from "@/lib/utils/typebox";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { cache } from "react";
import { getAddress } from "viem";
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
 * GraphQL query to fetch on-chain stablecoin list from The Graph
 *
 * @remarks
 * Retrieves stablecoins ordered by total supply in descending order
 */
const StableCoinList = theGraphGraphqlKit(
  `
  query StableCoinList($first: Int, $skip: Int) {
    stableCoins(orderBy: totalSupplyExact, orderDirection: desc, first: $first, skip: $skip) {
      ...StableCoinFragment
    }
  }
`,
  [StableCoinFragment]
);

/**
 * GraphQL query to fetch off-chain stablecoin list from Hasura
 */
const OffchainStableCoinList = hasuraGraphql(
  `
  query OffchainStableCoinList($limit: Int, $offset: Int) {
    asset_aggregate(limit: $limit, offset: $offset) {
      nodes {
        ...OffchainStableCoinFragment
      }
    }
  }
`,
  [OffchainStableCoinFragment]
);

/**
 * Fetches a list of stablecoins from both on-chain and off-chain sources
 *
 * @remarks
 * This function fetches data from both The Graph (on-chain) and Hasura (off-chain),
 * then merges the results to provide a complete view of each stablecoin.
 */
export const getStableCoinList = withTracing(
  "queries",
  "getStableCoinList",
  cache(async () => {
    "use cache";
    cacheTag("asset");
    const [onChainStableCoins, offChainStableCoins] = await Promise.all([
      fetchAllTheGraphPages(async (first, skip) => {
        const result = await theGraphClientKit.request(
          StableCoinList,
          {
            first,
            skip,
          },
          {
            "X-GraphQL-Operation-Name": "StableCoinList",
            "X-GraphQL-Operation-Type": "query",
            cache: "force-cache",
          }
        );

        return safeParse(
          t.Array(OnChainStableCoinSchema),
          result.stableCoins || []
        );
      }),

      fetchAllHasuraPages(async (pageLimit, offset) => {
        const result = await hasuraClient.request(
          OffchainStableCoinList,
          {
            limit: pageLimit,
            offset,
          },
          {
            "X-GraphQL-Operation-Name": "OffchainStableCoinList",
            "X-GraphQL-Operation-Type": "query",
            cache: "force-cache",
          }
        );

        return safeParse(
          t.Array(OffChainStableCoinSchema),
          result.asset_aggregate.nodes || []
        );
      }),
    ]);

    const assetsById = new Map(
      offChainStableCoins.map((asset) => [getAddress(asset.id), asset])
    );

    const calculatedFields = await stablecoinsCalculateFields(
      onChainStableCoins,
      offChainStableCoins
    );

    const stableCoins = onChainStableCoins.map((stableCoin) => {
      const offChainStableCoin = assetsById.get(getAddress(stableCoin.id));

      const calculatedStableCoin = calculatedFields.get(stableCoin.id)!;

      return {
        ...stableCoin,
        ...offChainStableCoin,
        ...calculatedStableCoin,
      };
    });

    return stableCoins;
  })
);

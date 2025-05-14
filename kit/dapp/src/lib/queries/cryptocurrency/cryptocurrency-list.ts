import "@/lib/utils/server-only";

import type { CurrencyCode } from "@/lib/db/schema-settings";
import { fetchAllHasuraPages, fetchAllTheGraphPages } from "@/lib/pagination";
import {
  OffChainCryptoCurrencySchema,
  OnChainCryptoCurrencySchema,
} from "@/lib/queries/cryptocurrency/cryptocurrency-schema";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { t } from "@/lib/utils/typebox";
import { safeParse } from "@/lib/utils/typebox/index";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { cache } from "react";
import { getAddress } from "viem";
import { cryptoCurrenciesCalculateFields } from "./cryptocurrency-calculated";
import {
  CryptoCurrencyFragment,
  OffchainCryptoCurrencyFragment,
} from "./cryptocurrency-fragment";
/**
 * GraphQL query to fetch on-chain cryptocurrency list from The Graph
 *
 * @remarks
 * Retrieves cryptocurrencys ordered by total supply in descending order
 */
const CryptoCurrencyList = theGraphGraphqlKit(
  `
  query CryptoCurrencyList($first: Int, $skip: Int) {
    cryptoCurrencies(orderBy: totalSupplyExact, orderDirection: desc, first: $first, skip: $skip) {
      ...CryptoCurrencyFragment
    }
  }
`,
  [CryptoCurrencyFragment]
);

/**
 * GraphQL query to fetch off-chain cryptocurrency list from Hasura
 */
const OffchainCryptocurrencyList = hasuraGraphql(
  `
  query OffchainCryptocurrencyList($limit: Int, $offset: Int) {
    asset_aggregate(limit: $limit, offset: $offset) {
      nodes {
        ...OffchainCryptoCurrencyFragment
      }
    }
  }
`,
  [OffchainCryptoCurrencyFragment]
);

/**
 * Fetches a list of cryptocurrencys from both on-chain and off-chain sources
 *
 * @param options - Options for fetching cryptocurrency list
 *
 * @remarks
 * This function fetches data from both The Graph (on-chain) and Hasura (off-chain),
 * then merges the results to provide a complete view of each cryptocurrency.
 */
export const getCryptoCurrencyList = withTracing(
  "queries",
  "getCryptoCurrencyList",
  cache(async (userCurrency: CurrencyCode) => {
    "use cache";
    cacheTag("asset");
    const [onChainCryptoCurrencies, offChainCryptoCurrencies] =
      await Promise.all([
        fetchAllTheGraphPages(async (first, skip) => {
          const result = await theGraphClientKit.request(
            CryptoCurrencyList,
            {
              first,
              skip,
            },
            {
              "X-GraphQL-Operation-Name": "CryptoCurrencyList",
              "X-GraphQL-Operation-Type": "query",
            }
          );

          return safeParse(
            t.Array(OnChainCryptoCurrencySchema),
            result.cryptoCurrencies || []
          );
        }),

        fetchAllHasuraPages(async (pageLimit, offset) => {
          const result = await hasuraClient.request(
            OffchainCryptocurrencyList,
            {
              limit: pageLimit,
              offset,
            },
            {
              "X-GraphQL-Operation-Name": "OffchainCryptocurrencyList",
              "X-GraphQL-Operation-Type": "query",
            }
          );

          return safeParse(
            t.Array(OffChainCryptoCurrencySchema),
            result.asset_aggregate.nodes || []
          );
        }),
      ]);

    const assetsById = new Map(
      offChainCryptoCurrencies.map((asset) => [getAddress(asset.id), asset])
    );

    const calculatedFields = await cryptoCurrenciesCalculateFields(
      onChainCryptoCurrencies,
      userCurrency
    );

    const cryptoCurrencies = onChainCryptoCurrencies.map((cryptocurrency) => {
      const offChainCryptoCurrency = assetsById.get(
        getAddress(cryptocurrency.id)
      );

      const calculatedCryptoCurrency = calculatedFields.get(cryptocurrency.id)!;

      return {
        ...cryptocurrency,
        ...offChainCryptoCurrency,
        ...calculatedCryptoCurrency,
      };
    });

    return cryptoCurrencies;
  })
);

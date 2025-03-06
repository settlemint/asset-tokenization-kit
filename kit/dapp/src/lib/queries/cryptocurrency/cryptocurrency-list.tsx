import { fetchAllHasuraPages, fetchAllTheGraphPages } from "@/lib/pagination";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import {
    theGraphClientKits,
    theGraphGraphqlKits,
} from "@/lib/settlemint/the-graph";
import { safeParseWithLogging } from "@/lib/utils/zod";
import { cache } from "react";
import { getAddress } from "viem";
import {
    CryptoCurrencyFragment,
    CryptoCurrencyFragmentSchema,
    OffchainCryptoCurrencyFragment,
    OffchainCryptoCurrencyFragmentSchema,
} from "./cryptocurrency-fragment";

/**
 * GraphQL query to fetch on-chain cryptocurrency list from The Graph
 *
 * @remarks
 * Retrieves cryptocurrencys ordered by total supply in descending order
 */
const CryptoCurrencyList = theGraphGraphqlKits(
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
export const getCryptoCurrencyList = cache(async () => {
  const [theGraphCryptoCurrencies, dbAssets] = await Promise.all([
    fetchAllTheGraphPages(async (first, skip) => {
      const result = await theGraphClientKits.request(
        CryptoCurrencyList,
        {
          first,
          skip,
        }
      );

      const cryptoCurrencies = result.cryptoCurrencies || [];

      return cryptoCurrencies;
    }),

    fetchAllHasuraPages(async (pageLimit, offset) => {
      const result = await hasuraClient.request(OffchainCryptocurrencyList, {
        limit: pageLimit,
        offset,
      });
      return result.asset_aggregate.nodes || [];
    }),
  ]);

  // Parse and validate the data using Zod schemas
  const validatedCryptoCurrencies = theGraphCryptoCurrencies.map(
    (cryptocurrency) =>
      safeParseWithLogging(
        CryptoCurrencyFragmentSchema,
        cryptocurrency,
        "cryptocurrency"
      )
  );

  const validatedDbAssets = dbAssets.map((asset) =>
    safeParseWithLogging(
      OffchainCryptoCurrencyFragmentSchema,
      asset,
      "offchain cryptocurrency"
    )
  );

  const assetsById = new Map(
    validatedDbAssets.map((asset) => [getAddress(asset.id), asset])
  );

  const cryptoCurrencies = validatedCryptoCurrencies.map((cryptocurrency) => {
    const dbAsset = assetsById.get(getAddress(cryptocurrency.id));

    return {
      ...cryptocurrency,
      ...{
        private: false,
        ...dbAsset,
      },
    };
  });

  return cryptoCurrencies.map((cryptocurrency) => ({
    ...cryptocurrency,
  }));
});

import "server-only";

import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox/index";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { cache } from "react";
import { type Address, getAddress } from "viem";
import { cryptoCurrenciesCalculateFields } from "./cryptocurrency-calculated";
import {
  CryptoCurrencyFragment,
  OffchainCryptoCurrencyFragment,
} from "./cryptocurrency-fragment";
import {
  OffChainCryptoCurrencySchema,
  OnChainCryptoCurrencySchema,
} from "./cryptocurrency-schema";

/**
 * GraphQL query to fetch on-chain cryptocurrency details from The Graph
 */
const CryptoCurrencyDetail = theGraphGraphqlKit(
  `
  query CryptoCurrencyDetail($id: ID!) {
    cryptoCurrency(id: $id) {
      ...CryptoCurrencyFragment
    }
  }
`,
  [CryptoCurrencyFragment]
);

/**
 * GraphQL query to fetch off-chain cryptocurrency details from Hasura
 */
const OffchainCryptoCurrencyDetail = hasuraGraphql(
  `
  query OffchainCryptoCurrencyDetail($id: String!) {
    asset(where: {id: {_eq: $id}}, limit: 1) {
      ...OffchainCryptoCurrencyFragment
    }
  }
`,
  [OffchainCryptoCurrencyFragment]
);

/**
 * Props interface for cryptocurrency detail components
 */
export interface CryptoCurrencyDetailProps {
  /** Ethereum address of the cryptocurrency contract */
  address: Address;
}

/**
 * Fetches and combines on-chain and off-chain cryptocurrency data
 *
 * @param params - Object containing the cryptocurrency address
 * @returns Combined cryptocurrency data with additional calculated metrics
 * @throws Error if fetching or parsing fails
 */
export const getCryptoCurrencyDetail = withTracing(
  "queries",
  "getCryptoCurrencyDetail",
  cache(async ({ address }: CryptoCurrencyDetailProps) => {
    "use cache";
    cacheTag("asset");
    const [onChainCryptoCurrency, offChainCryptoCurrency] = await Promise.all([
      (async () => {
        const response = await theGraphClientKit.request(
          CryptoCurrencyDetail,
          {
            id: address,
          },
          {
            "X-GraphQL-Operation-Name": "CryptoCurrencyDetail",
            "X-GraphQL-Operation-Type": "query",
          }
        );
        if (!response.cryptoCurrency) {
          throw new Error("Cryptocurrency not found");
        }
        return safeParse(OnChainCryptoCurrencySchema, response.cryptoCurrency);
      })(),
      (async () => {
        const response = await hasuraClient.request(
          OffchainCryptoCurrencyDetail,
          {
            id: getAddress(address),
          },
          {
            "X-GraphQL-Operation-Name": "OffchainCryptoCurrencyDetail",
            "X-GraphQL-Operation-Type": "query",
          }
        );
        if (response.asset.length === 0) {
          return undefined;
        }
        return safeParse(OffChainCryptoCurrencySchema, response.asset[0]);
      })(),
    ]);

    const calculatedFields = await cryptoCurrenciesCalculateFields(
      [onChainCryptoCurrency],
      [offChainCryptoCurrency]
    );
    const calculatedCryptoCurrency = calculatedFields.get(
      onChainCryptoCurrency.id
    )!;

    return {
      ...onChainCryptoCurrency,
      ...offChainCryptoCurrency,
      ...calculatedCryptoCurrency,
    };
  })
);

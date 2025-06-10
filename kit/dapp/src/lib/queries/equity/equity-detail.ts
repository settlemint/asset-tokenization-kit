import "server-only";

import type { CurrencyCode } from "@/lib/db/schema-settings";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/sentry-tracing";
import { safeParse } from "@/lib/utils/typebox/index";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { cache } from "react";
import { type Address, getAddress } from "viem";
import { equitiesCalculateFields } from "./equity-calculated";
import { EquityFragment, OffchainEquityFragment } from "./equity-fragment";
import { OffChainEquitySchema, OnChainEquitySchema } from "./equity-schema";
/**
 * GraphQL query to fetch on-chain equity details from The Graph
 */
// const EquityDetail = theGraphGraphqlKit(
//   `
//   query EquityDetail($id: ID!) {
//     equity(id: $id) {
//       ...EquityFragment
//     }
//   }
// `,
//   [EquityFragment]
// );

/**
 * GraphQL query to fetch off-chain equity details from Hasura
 */
const OffchainEquityDetail = hasuraGraphql(
  `
  query OffchainEquityDetail($id: String!) {
    asset(where: {id: {_eq: $id}}, limit: 1) {
      ...OffchainEquityFragment
    }
  }
`,
  [OffchainEquityFragment]
);

/**
 * Props interface for equity detail components
 */
export interface EquityDetailProps {
  /** Ethereum address of the equity contract */
  address: Address;
  /** Currency code for the user */
  userCurrency: CurrencyCode;
}

/**
 * Fetches and combines on-chain and off-chain equity data
 *
 * @param params - Object containing the equity address
 * @returns Combined equity data with additional calculated metrics
 * @throws Error if fetching or parsing fails
 */
export const getEquityDetail = withTracing(
  "queries",
  "getEquityDetail",
  cache(async ({ address, userCurrency }: EquityDetailProps) => {
    "use cache";
    cacheTag("asset");
    const [onChainEquity, offChainEquity] = await Promise.all([
      (async () => {
              //       // const response = await theGraphClientKit.request(
      //       //           EquityDetail,
      //       //           {
      //       //             id: address,
      //       //           },
      //       //           {
      //       //             "X-GraphQL-Operation-Name": "EquityDetail",
      //       //             "X-GraphQL-Operation-Type": "query",
      //       //           }
      //       //         );
        if (!response.equity) {
          throw new Error("Equity not found");
        }
        return safeParse(OnChainEquitySchema, response.equity);
      })(),
      (async () => {
        const response = await hasuraClient.request(
          OffchainEquityDetail,
          {
            id: getAddress(address),
          },
          {
            "X-GraphQL-Operation-Name": "OffchainEquityDetail",
            "X-GraphQL-Operation-Type": "query",
          }
        );
        if (response.asset.length === 0) {
          return undefined;
        }
        return safeParse(OffChainEquitySchema, response.asset[0]);
      })(),
    ]);

    const calculatedFields = await equitiesCalculateFields(
      [onChainEquity],
      userCurrency
    );
    const calculatedEquity = calculatedFields.get(onChainEquity.id)!;

    return {
      ...onChainEquity,
      ...offChainEquity,
      ...calculatedEquity,
    };
  })
);

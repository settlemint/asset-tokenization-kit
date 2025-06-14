import "server-only";

import type { CurrencyCode } from "@/lib/db/schema-settings";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { withTracing } from "@/lib/utils/sentry-tracing";
import { safeParse } from "@/lib/utils/typebox/index";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { cache } from "react";
import { type Address, getAddress } from "viem";
import { fundsCalculateFields } from "./fund-calculated";
import { OffchainFundFragment } from "./fund-fragment";
import { OffChainFundSchema, OnChainFundSchema } from "./fund-schema";
/**
 * GraphQL query to fetch on-chain fund details from The Graph
 */
// const FundDetail = theGraphGraphqlKit(
//   `
//   query FundDetail($id: ID!) {
//     fund(id: $id) {
//       ...FundFragment
//     }
//   }
// `,
//   [FundFragment]
// );

/**
 * GraphQL query to fetch off-chain fund details from Hasura
 */
const OffchainFundDetail = hasuraGraphql(
  `
  query OffchainFundDetail($id: String!) {
    asset(where: {id: {_eq: $id}}, limit: 1) {
      ...OffchainFundFragment
    }
  }
`,
  [OffchainFundFragment]
);

/**
 * Props interface for fund detail components
 */
export interface FundDetailProps {
  /** Ethereum address of the fund contract */
  address: Address;
  /** Currency code for the user */
  userCurrency: CurrencyCode;
}

/**
 * Fetches and combines on-chain and off-chain fund data
 *
 * @param params - Object containing the fund address
 * @returns Combined fund data with additional calculated metrics
 * @throws Error if fetching or parsing fails
 */
export const getFundDetail = withTracing(
  "queries",
  "getFundDetail",
  cache(async ({ address, userCurrency }: FundDetailProps) => {
    "use cache";
    cacheTag("asset");
    const [onChainFund, offChainFund] = await Promise.all([
      (async () => {
        //       // const response = await theGraphClientKit.request(
        //       //           FundDetail,
        //       //           {
        //       //             id: address,
        //       //           },
        //       //           {
        //       //             "X-GraphQL-Operation-Name": "FundDetail",
        //       //             "X-GraphQL-Operation-Type": "query",
        //       //           }
        //       //         );
        // if (!response.fund) {
        //   throw new Error("Fund not found");
        // }
        return safeParse(OnChainFundSchema, {});
      })(),
      (async () => {
        const response = await hasuraClient.request(
          OffchainFundDetail,
          {
            id: getAddress(address),
          },
          {
            "X-GraphQL-Operation-Name": "OffchainFundDetail",
            "X-GraphQL-Operation-Type": "query",
          }
        );
        if (response.asset.length === 0) {
          return undefined;
        }
        return safeParse(OffChainFundSchema, response.asset[0]);
      })(),
    ]);

    const calculatedFields = await fundsCalculateFields(
      [onChainFund],
      userCurrency
    );
    const calculatedFund = calculatedFields.get(onChainFund.id)!;

    return {
      ...onChainFund,
      ...offChainFund,
      ...calculatedFund,
    };
  })
);

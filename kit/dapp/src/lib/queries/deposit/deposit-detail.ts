import "server-only";

import type { CurrencyCode } from "@/lib/db/schema-settings";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { withTracing } from "@/lib/utils/sentry-tracing";
import { safeParse } from "@/lib/utils/typebox";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { cache } from "react";
import { type Address, getAddress } from "viem";
import { depositsCalculateFields } from "./deposit-calculated";
import { OffchainDepositFragment } from "./deposit-fragment";
import { OffChainDepositSchema, OnChainDepositSchema } from "./deposit-schema";
/**
 * GraphQL query to fetch on-chain tokenized deposit details from The Graph
 */
// const DepositDetail = theGraphGraphqlKit(
//   `
//   query DepositDetail($id: ID!) {
//     deposit(id: $id) {
//       ...DepositFragment
//     }
//   }
// `,
//   [DepositFragment]
// );

/**
 * GraphQL query to fetch off-chain tokenized deposit details from Hasura
 */
const OffchainDepositDetail = hasuraGraphql(
  `
  query OffchainDepositDetail($id: String!) {
    asset(where: {id: {_eq: $id}}, limit: 1) {
      ...OffchainDepositFragment
    }
  }
`,
  [OffchainDepositFragment]
);

/**
 * Props interface for tokenized deposit detail components
 */
export interface DepositDetailProps {
  /** Ethereum address of the tokenized deposit contract */
  address: Address;
  /** Currency code for the user */
  userCurrency: CurrencyCode;
}

/**
 * Fetches and combines on-chain and off-chain tokenized deposit data
 *
 * @param params - Object containing the tokenized deposit address
 * @returns Combined tokenized deposit data with additional calculated metrics
 * @throws Error if fetching or parsing fails
 */
export const getDepositDetail = withTracing(
  "queries",
  "getDepositDetail",
  cache(async ({ address, userCurrency }: DepositDetailProps) => {
    "use cache";
    cacheTag("asset");
    const [onChainDeposit, offChainDeposit] = await Promise.all([
      (async () => {
        //       // const response = await theGraphClientKit.request(
        //       //           DepositDetail,
        //       //           {
        //       //             id: address,
        //       //           },
        //       //           {
        //       //             "X-GraphQL-Operation-Name": "DepositDetail",
        //       //             "X-GraphQL-Operation-Type": "query",
        //       //           }
        //       //         );
        // if (!response.deposit) {
        //   throw new Error("Deposit not found");
        // }
        return safeParse(OnChainDepositSchema, {});
      })(),
      (async () => {
        const response = await hasuraClient.request(
          OffchainDepositDetail,
          {
            id: getAddress(address),
          },
          {
            "X-GraphQL-Operation-Name": "OffchainDepositDetail",
            "X-GraphQL-Operation-Type": "query",
          }
        );
        if (response.asset.length === 0) {
          return undefined;
        }
        return safeParse(OffChainDepositSchema, response.asset[0]);
      })(),
    ]);

    const calculatedFields = await depositsCalculateFields(
      [onChainDeposit],
      userCurrency
    );
    const calculatedDeposit = calculatedFields.get(onChainDeposit.id)!;

    return {
      ...onChainDeposit,
      ...offChainDeposit,
      ...calculatedDeposit,
    };
  })
);

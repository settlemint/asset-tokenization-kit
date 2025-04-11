"use server";

import { fetchAllHasuraPages, fetchAllTheGraphPages } from "@/lib/pagination";
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
import { fundsCalculateFields } from "./fund-calculated";
import { FundFragment, OffchainFundFragment } from "./fund-fragment";
import { OffChainFundSchema, OnChainFundSchema } from "./fund-schema";

/**
 * GraphQL query to fetch on-chain fund list from The Graph
 *
 * @remarks
 * Retrieves funds ordered by total supply in descending order
 */
const FundList = theGraphGraphqlKit(
  `
  query FundList($first: Int, $skip: Int) {
    funds(orderBy: totalSupplyExact, orderDirection: desc, first: $first, skip: $skip) {
      ...FundFragment
    }
  }
`,
  [FundFragment]
);

/**
 * GraphQL query to fetch off-chain fund list from Hasura
 */
const OffchainFundList = hasuraGraphql(
  `
  query OffchainFundList($limit: Int, $offset: Int) {
    asset_aggregate(limit: $limit, offset: $offset) {
      nodes {
        ...OffchainFundFragment
      }
    }
  }
`,
  [OffchainFundFragment]
);

/**
 * Fetches a list of funds from both on-chain and off-chain sources
 *
 * @param options - Options for fetching fund list
 *
 * @remarks
 * This function fetches data from both The Graph (on-chain) and Hasura (off-chain),
 * then merges the results to provide a complete view of each fund.
 */
export const getFundList = withTracing(
  "queries",
  "getFundList",
  cache(async () => {
    "use cache";
    cacheTag("asset");
    const [onChainFunds, offChainFunds] = await Promise.all([
      fetchAllTheGraphPages(async (first, skip) => {
        const result = await theGraphClientKit.request(
          FundList,
          {
            first,
            skip,
          },
          {
            "X-GraphQL-Operation-Name": "FundList",
            "X-GraphQL-Operation-Type": "query",
            cache: "force-cache",
          }
        );

        return safeParse(t.Array(OnChainFundSchema), result.funds || []);
      }),

      fetchAllHasuraPages(async (pageLimit, offset) => {
        const result = await hasuraClient.request(
          OffchainFundList,
          {
            limit: pageLimit,
            offset,
          },
          {
            "X-GraphQL-Operation-Name": "OffchainFundList",
            "X-GraphQL-Operation-Type": "query",
            cache: "force-cache",
          }
        );

        return safeParse(
          t.Array(OffChainFundSchema),
          result.asset_aggregate.nodes || []
        );
      }),
    ]);

    const assetsById = new Map(
      offChainFunds.map((asset) => [getAddress(asset.id), asset])
    );

    const calculatedFields = await fundsCalculateFields(
      onChainFunds,
      offChainFunds
    );

    const funds = onChainFunds.map((fund) => {
      const offChainFund = assetsById.get(getAddress(fund.id));

      const calculatedFund = calculatedFields.get(fund.id)!;

      return {
        ...fund,
        ...offChainFund,
        ...calculatedFund,
      };
    });

    return funds;
  })
);

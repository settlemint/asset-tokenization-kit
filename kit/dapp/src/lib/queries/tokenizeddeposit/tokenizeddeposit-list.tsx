import { fetchAllHasuraPages, fetchAllTheGraphPages } from "@/lib/pagination";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { safeParse, t } from "@/lib/utils/typebox";
import { cache } from "react";
import { getAddress } from "viem";
import { tokenizedDepositCalculateFields } from "./tokenizeddeposit-calculated";
import {
  OffchainTokenizedDepositFragment,
  TokenizedDepositFragment,
} from "./tokenizeddeposit-fragment";
import {
  OffChainTokenizedDepositSchema,
  OnChainTokenizedDepositSchema,
} from "./tokenizeddeposit-schema";

/**
 * GraphQL query to fetch on-chain tokenized deposit list from The Graph
 *
 * @remarks
 * Retrieves tokenized deposits ordered by total supply in descending order
 */
const TokenizedDepositList = theGraphGraphqlKit(
  `
  query TokenizedDepositList($first: Int, $skip: Int) {
    tokenizedDeposits(orderBy: totalSupplyExact, orderDirection: desc, first: $first, skip: $skip) {
      ...TokenizedDepositFragment
    }
  }
`,
  [TokenizedDepositFragment]
);

/**
 * GraphQL query to fetch off-chain tokenized deposit list from Hasura
 */
const OffchainTokenizedDepositList = hasuraGraphql(
  `
  query OffchainTokenizedDepositList($limit: Int, $offset: Int) {
    asset_aggregate(limit: $limit, offset: $offset) {
      nodes {
        ...OffchainTokenizedDepositFragment
      }
    }
  }
`,
  [OffchainTokenizedDepositFragment]
);

/**
 * Fetches a list of tokenized deposits from both on-chain and off-chain sources
 *
 * @remarks
 * This function fetches data from both The Graph (on-chain) and Hasura (off-chain),
 * then merges the results to provide a complete view of each tokenized deposit.
 */
export const getTokenizedDepositList = cache(async () => {
  const [onChainTokenizedDeposits, offChainTokenizedDeposits] =
    await Promise.all([
      fetchAllTheGraphPages(async (first, skip) => {
        const result = await theGraphClientKit.request(TokenizedDepositList, {
          first,
          skip,
        });

        return safeParse(
          t.Array(OnChainTokenizedDepositSchema),
          result.tokenizedDeposits || []
        );
      }),

      fetchAllHasuraPages(async (pageLimit, offset) => {
        const result = await hasuraClient.request(
          OffchainTokenizedDepositList,
          {
            limit: pageLimit,
            offset,
          }
        );

        return safeParse(
          t.Array(OffChainTokenizedDepositSchema),
          result.asset_aggregate.nodes || []
        );
      }),
    ]);

  const assetsById = new Map(
    offChainTokenizedDeposits.map((asset) => [getAddress(asset.id), asset])
  );

  const tokenizedDeposits = onChainTokenizedDeposits.map((tokenizedDeposit) => {
    const offChainTokenizedDeposit = assetsById.get(
      getAddress(tokenizedDeposit.id)
    );

    const calculatedFields = tokenizedDepositCalculateFields(
      tokenizedDeposit,
      offChainTokenizedDeposit
    );

    return {
      ...tokenizedDeposit,
      ...offChainTokenizedDeposit,
      ...calculatedFields,
    };
  });

  return tokenizedDeposits;
});

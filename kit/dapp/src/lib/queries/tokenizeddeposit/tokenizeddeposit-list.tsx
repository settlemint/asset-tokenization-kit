import { fetchAllHasuraPages, fetchAllTheGraphPages } from "@/lib/pagination";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { safeParseWithLogging } from "@/lib/utils/zod";
import { cache } from "react";
import { getAddress } from "viem";
import {
  OffchainTokenizedDepositFragment,
  OffchainTokenizedDepositFragmentSchema,
  TokenizedDepositFragment,
  TokenizedDepositFragmentSchema,
} from "./tokenizeddeposit-fragment";

/**
 * GraphQL query to fetch on-chain stablecoin list from The Graph
 *
 * @remarks
 * Retrieves stablecoins ordered by total supply in descending order
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
 * GraphQL query to fetch off-chain stablecoin list from Hasura
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
 * Fetches a list of stablecoins from both on-chain and off-chain sources
 */
export const getTokenizedDepositList = cache(async () => {
  const [theGraphTokenizedDeposits, dbAssets] = await Promise.all([
    fetchAllTheGraphPages(async (first, skip) => {
      const result = await theGraphClientKit.request(TokenizedDepositList, {
        first,
        skip,
      });

      const tokenizedDeposits = result.tokenizedDeposits || [];

      return tokenizedDeposits;
    }),

    fetchAllHasuraPages(async (pageLimit, offset) => {
      const result = await hasuraClient.request(OffchainTokenizedDepositList, {
        limit: pageLimit,
        offset,
      });
      return result.asset_aggregate.nodes || [];
    }),
  ]);

  // Parse and validate the data using Zod schemas
  const validatedTokenizedDeposits = theGraphTokenizedDeposits.map(
    (tokenizedDeposit) =>
      safeParseWithLogging(
        TokenizedDepositFragmentSchema,
        tokenizedDeposit,
        "tokenized deposit"
      )
  );

  const validatedDbAssets = dbAssets.map((asset) =>
    safeParseWithLogging(
      OffchainTokenizedDepositFragmentSchema,
      asset,
      "offchain tokenized deposit"
    )
  );

  const assetsById = new Map(
    validatedDbAssets.map((asset) => [getAddress(asset.id), asset])
  );

  return validatedTokenizedDeposits.map((tokenizedDeposit) => {
    const dbAsset = assetsById.get(getAddress(tokenizedDeposit.id));

    return {
      ...tokenizedDeposit,
      ...dbAsset,
    };
  });
});

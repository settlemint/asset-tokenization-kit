import "server-only";

import { AirdropDistributionListSchema } from "@/lib/mutations/airdrop/create/common/airdrop-distribution-schema";
import { fetchAllHasuraPages } from "@/lib/pagination";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import type { Address } from "viem";
import { OffchainAirdropFragment } from "./airdrop-fragment";

/**
 * GraphQL query to fetch ALL distributions for a specific airdrop from Hasura
 *
 * @remarks
 * Retrieves all airdrop distributions for a specific airdrop (used for merkle tree creation)
 */
const AirdropDistribution = hasuraGraphql(
  `
  query AirdropDistribution($airdrop: String!, $limit: Int, $offset: Int) {
    airdrop_distribution(
      where: {
        airdrop_id: { _eq: $airdrop }
      }
      limit: $limit
      offset: $offset
      order_by: { index: asc }
    ) {
      ...OffchainAirdropFragment
    }
  }
`,
  [OffchainAirdropFragment]
);

/**
 * Fetches ALL distribution details for a specific airdrop
 *
 * @param airdropAddress - The address of the airdrop contract
 * @returns Promise<Array> - All airdrop distribution records for the airdrop
 * @remarks
 * This function fetches all distribution data from Hasura for a specific airdrop.
 * It's primarily used for creating merkle trees during the claim process.
 * Results are ordered by index for consistent merkle tree generation.
 */
export const getAirdropDistribution = withTracing(
  "queries",
  "getAirdropDistribution",
  async (airdropAddress: Address) => {
    "use cache";
    cacheTag("airdrop");

    const distributions = await fetchAllHasuraPages(async (limit, offset) => {
      const result = await hasuraClient.request(
        AirdropDistribution,
        {
          limit,
          offset,
          airdrop: airdropAddress,
        },
        {
          "X-GraphQL-Operation-Name": "AirdropDistributions",
          "X-GraphQL-Operation-Type": "query",
        }
      );

      return result.airdrop_distribution;
    });

    // Transform string indices to numbers before validation
    const transformedDistributions = distributions.map((distribution) => ({
      ...distribution,
      index: Number(distribution.index),
    }));

    return safeParse(AirdropDistributionListSchema, transformedDistributions);
  }
);

import "server-only";

import { fetchAllHasuraPages } from "@/lib/pagination";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { withTracing } from "@/lib/utils/tracing";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import type { Address } from "viem";
import { OffchainAirdropFragment } from "./airdrop-fragment";

/**
 * GraphQL query to fetch a specific airdrop distribution from Hasura
 *
 * @remarks
 * Retrieves a single airdrop distribution where the user is a recipient for a specific airdrop
 */
const UserAirdropDistribution = hasuraGraphql(
  `
  query UserAirdropDistribution($recipient: String!, $airdrop: String!, $limit: Int, $offset: Int) {
    airdrop_distribution(
      where: {
        recipient: { _eq: $recipient }
        airdrop_id: { _eq: $airdrop }
      }
      limit: $limit
      offset: $offset
    ) {
      ...OffchainAirdropFragment
    }
  }
`,
  [OffchainAirdropFragment]
);

/**
 * Fetches distribution details for a specific airdrop and recipient combination
 *
 * @param airdropAddress - The address of the airdrop contract
 * @param recipient - The user to get distribution details for
 * @returns Promise<Array> - The airdrop distribution records for the recipient
 * @remarks
 * This function fetches distribution data from Hasura for a specific airdrop and recipient.
 * It uses pagination to handle large datasets and includes proper caching for performance.
 * This function is used for getting user-specific distribution details.
 */
export const getUserAirdropDistribution = withTracing(
  "queries",
  "getUserAirdropDistribution",
  async (airdropAddress: Address, user: Address) => {
    "use cache";
    cacheTag("airdrop");

    const distributions = await fetchAllHasuraPages(async (limit, offset) => {
      const result = await hasuraClient.request(
        UserAirdropDistribution,
        {
          limit,
          offset,
          recipient: user,
          airdrop: airdropAddress,
        },
        {
          "X-GraphQL-Operation-Name": "AirdropRecipientDistribution",
          "X-GraphQL-Operation-Type": "query",
        }
      );

      return result.airdrop_distribution;
    });

    if (distributions.length !== 1) {
      throw new Error(`Expected 1 distribution, got ${distributions.length}`);
    }

    return distributions[0];
  }
);

/**
 * GraphQL query to fetch airdrop distributions from Hasura filtered by recipient
 *
 * @remarks
 * Retrieves airdrop distributions where the user is a recipient, ordered by amount in descending order
 */
const UserAirdropDistributionList = hasuraGraphql(
  `
  query UserAirdropDistributionList($limit: Int, $offset: Int, $recipient: String!) {
    airdrop_distribution(
      where: { recipient: { _eq: $recipient } }
      limit: $limit
      offset: $offset
    ) {
      ...OffchainAirdropFragment
    }
  }
`,
  [OffchainAirdropFragment]
);

export const getUserAirdropDistributionList = withTracing(
  "queries",
  "getUserAirdropDistributionList",
  async (user: Address) => {
    "use cache";
    cacheTag("airdrop");

    const distributions = await fetchAllHasuraPages(async (limit, offset) => {
      const result = await hasuraClient.request(
        UserAirdropDistributionList,
        {
          limit,
          offset,
          recipient: user,
        },
        {
          "X-GraphQL-Operation-Name": "UserAirdropDistributionList",
          "X-GraphQL-Operation-Type": "query",
        }
      );

      return result.airdrop_distribution;
    });

    return distributions;
  }
);

import "server-only";

import type { User } from "@/lib/auth/types";
import {
  AirdropDistributionListSchema,
  AirdropDistributionSchema,
} from "@/lib/mutations/airdrop/create/common/airdrop-distribution-schema";
import { fetchAllHasuraPages } from "@/lib/pagination";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import type { Address } from "viem";
import { OffchainAirdropFragment } from "./airdrop-fragment";
import { AirdropRecipientFragment } from "./airdrop-recipient-fragment";

/**
 * Common GraphQL query to fetch off-chain airdrop distribution details from Hasura
 *
 * @remarks
 * This query is shared across different airdrop types (standard, vesting, push, etc.)
 * since they all have the same off-chain distribution data structure
 */
export const OffchainAirdropDistributionDetail = hasuraGraphql(
  `
  query OffchainAirdropDistributionDetail($id: String!) {
    airdrop_distribution(where: {airdrop_id: {_eq: $id}}) {
      ...OffchainAirdropFragment
    }
  }
`,
  [OffchainAirdropFragment]
);

/**
 * GraphQL query to fetch ALL distributions for a specific airdrop from Hasura
 *
 * @remarks
 * Retrieves all airdrop distributions for a specific airdrop (used for merkle tree creation)
 */
const AllAirdropDistributions = hasuraGraphql(
  `
  query AllAirdropDistributions($airdrop: String!, $limit: Int, $offset: Int) {
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
 * GraphQL query to fetch a specific airdrop distribution from Hasura
 *
 * @remarks
 * Retrieves a single airdrop distribution where the user is a recipient for a specific airdrop
 */
const AirdropRecipientDistribution = hasuraGraphql(
  `
  query AirdropRecipientDistribution($recipient: String!, $airdrop: String!, $limit: Int, $offset: Int) {
    airdrop_distribution(
      where: {
        recipient: { _eq: $recipient }
        airdrop_id: { _eq: $airdrop }
      }
      limit: $limit
      offset: $offset
    ) {
      ...AirdropRecipientFragment
    }
  }
`,
  [AirdropRecipientFragment]
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
export const getAllAirdropDistributions = withTracing(
  "queries",
  "getAllAirdropDistributions",
  async (airdropAddress: Address) => {
    "use cache";
    cacheTag("airdrop");

    const distributions = await fetchAllHasuraPages(async (limit, offset) => {
      const result = await hasuraClient.request(
        AllAirdropDistributions,
        {
          limit,
          offset,
          airdrop: airdropAddress,
        },
        {
          "X-GraphQL-Operation-Name": "AllAirdropDistributions",
          "X-GraphQL-Operation-Type": "query",
        }
      );

      return result.airdrop_distribution;
    });

    return safeParse(AirdropDistributionListSchema, distributions);
  }
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
export const getAirdropRecipientDistribution = withTracing(
  "queries",
  "getAirdropRecipientDistribution",
  async (airdropAddress: Address, recipient: User) => {
    "use cache";
    cacheTag("airdrop");

    const distributions = await fetchAllHasuraPages(async (limit, offset) => {
      const result = await hasuraClient.request(
        AirdropRecipientDistribution,
        {
          limit,
          offset,
          recipient: recipient.wallet,
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

    return safeParse(AirdropDistributionSchema, distributions[0]);
  }
);

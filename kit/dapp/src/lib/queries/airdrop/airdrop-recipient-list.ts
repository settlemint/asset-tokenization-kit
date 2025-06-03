import "server-only";

import { fetchAllHasuraPages } from "@/lib/pagination";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { t } from "@/lib/utils/typebox";
import { safeParse } from "@/lib/utils/typebox/index";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import type { Address } from "viem";
import { AirdropFragment } from "./airdrop-fragment";
import { AirdropRecipientFragment } from "./airdrop-recipient-fragment";
import { AirdropRecipientSchema } from "./airdrop-recipient-schema";
import { OnChainAirdropSchema, type OnChainAirdrop } from "./airdrop-schema";

/**
 * GraphQL query to fetch airdrop distributions from Hasura filtered by recipient
 *
 * @remarks
 * Retrieves airdrop distributions where the user is a recipient, ordered by amount in descending order
 */
const AirdropRecipientList = hasuraGraphql(
  `
  query AirdropRecipientList($limit: Int, $offset: Int, $recipient: String!) {
    airdrop_distribution(
      where: { recipient: { _ilike: $recipient } }
      order_by: { amount: desc }
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
 * GraphQL query to fetch airdrop details from The Graph by IDs
 *
 * @remarks
 * Used to get complete airdrop information including asset details
 */
const AirdropDetailsByIds = theGraphGraphqlKit(
  `
  query AirdropDetailsByIds($ids: [Bytes!]!) {
    airdrops(where: { id_in: $ids }) {
      ...AirdropFragment
    }
  }
`,
  [AirdropFragment]
);

/**
 * Fetches a list of airdrops from Hasura where the specified user is a recipient
 *
 * @param recipient - The address of the user to filter airdrop distributions by
 * @remarks
 * This function fetches data from both Hasura (off-chain distribution data) and
 * The Graph (on-chain airdrop and asset data) to provide a complete view of
 * airdrop distributions where the user is eligible to claim tokens.
 * Includes complete airdrop details, distribution amount, index, and claim status.
 */
export const getAirdropRecipientList = withTracing(
  "queries",
  "getAirdropRecipientList",
  async (recipient: Address) => {
    "use cache";
    cacheTag("airdrop");

    const airdropDistributions = await fetchAllHasuraPages(
      async (limit, offset) => {
        const result = await hasuraClient.request(
          AirdropRecipientList,
          {
            limit,
            offset,
            recipient,
          },
          {
            "X-GraphQL-Operation-Name": "AirdropRecipientList",
            "X-GraphQL-Operation-Type": "query",
          }
        );

        const distributions = result.airdrop_distribution || [];

        if (distributions.length === 0) {
          return [];
        }

        // Get unique airdrop IDs to fetch complete airdrop information
        const uniqueAirdropIds = [
          ...new Set(distributions.map((d) => d.airdrop)),
        ];

        // Fetch complete airdrop details from The Graph
        const airdropDetailsResult = await theGraphClientKit.request(
          AirdropDetailsByIds,
          { ids: uniqueAirdropIds },
          {
            "X-GraphQL-Operation-Name": "AirdropDetailsByIds",
            "X-GraphQL-Operation-Type": "query",
          }
        );

        // Validate and create a map of airdrop ID to complete airdrop data
        const validatedAirdrops = safeParse(
          t.Array(OnChainAirdropSchema),
          airdropDetailsResult.airdrops || []
        );

        const airdropDataMap = new Map<string, OnChainAirdrop>();
        validatedAirdrops.forEach((airdrop) => {
          airdropDataMap.set(airdrop.id, airdrop);
        });

        // Combine distribution data with complete airdrop information
        const recipientDataWithAirdropDetails = distributions
          .map((item) => {
            const airdropData = airdropDataMap.get(item.airdrop);
            if (!airdropData) {
              return null; // Skip distributions where airdrop data is not found
            }

            return {
              airdrop: airdropData,
              amount: item.amount,
              index: item.index,
              claimed: item.claimed,
            };
          })
          .filter(Boolean); // Remove null entries

        return safeParse(
          t.Array(AirdropRecipientSchema),
          recipientDataWithAirdropDetails
        );
      }
    );

    return airdropDistributions;
  }
);

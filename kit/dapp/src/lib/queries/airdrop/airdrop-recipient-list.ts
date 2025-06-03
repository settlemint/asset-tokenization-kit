import "server-only";

import { fetchAllHasuraPages } from "@/lib/pagination";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { withTracing } from "@/lib/utils/tracing";
import { t } from "@/lib/utils/typebox";
import { safeParse } from "@/lib/utils/typebox/index";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import type { Address } from "viem";
import { OffchainAirdropFragment } from "./airdrop-fragment";
import { OffChainAirdropSchema } from "./airdrop-schema";

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
      ...OffchainAirdropFragment
      airdrop_id
      index
      claimed
    }
  }
`,
  [OffchainAirdropFragment]
);

/**
 * Fetches a list of airdrops from Hasura where the specified user is a recipient
 *
 * @param recipient - The address of the user to filter airdrop distributions by
 * @remarks
 * This function fetches data from Hasura (off-chain) to provide
 * a complete view of airdrop distributions where the user is eligible to claim tokens.
 * Includes distribution details like amount, index, and claim status.
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

        // Extend the schema to include the additional fields from the distribution table
        const ExtendedOffChainAirdropSchema = t.Intersect([
          OffChainAirdropSchema,
          t.Object({
            airdrop_id: t.String({
              description: "The airdrop contract address",
            }),
            index: t.Number({
              description: "The index of the recipient in the Merkle tree",
            }),
            claimed: t.Optional(
              t.String({
                description:
                  "Timestamp when the airdrop was claimed, null if not claimed",
              })
            ),
          }),
        ]);

        return safeParse(
          t.Array(ExtendedOffChainAirdropSchema),
          result.airdrop_distribution || []
        );
      }
    );

    return airdropDistributions;
  }
);

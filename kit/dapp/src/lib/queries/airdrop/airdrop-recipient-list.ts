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
import type { ResultOf } from "@settlemint/sdk-thegraph";
import { getAddress, type Address } from "viem";
import { PushAirdropFragment } from "../push-airdrop/push-airdrop-fragment";
import { StandardAirdropFragment } from "../standard-airdrop/standard-airdrop-fragment";
import { VestingAirdropFragment } from "../vesting-airdrop/vesting-airdrop-fragment";
import {
  AirdropClaimFragment,
  AirdropRecipientFragment,
} from "./airdrop-recipient-fragment";
import {
  AirdropClaimSchema,
  AirdropRecipientSchema,
  type AirdropRecipient,
} from "./airdrop-recipient-schema";

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
 * Used to get complete airdrop information including asset details and type-specific fields
 */
const AirdropDetailsByIds = theGraphGraphqlKit(
  `
  query AirdropDetailsByIds($ids: [Bytes!]!) {
    airdrops(where: { id_in: $ids }) {
      ... on StandardAirdrop {
        ...StandardAirdropFragment
      }
      ... on VestingAirdrop {
        ...VestingAirdropFragment
      }
      ... on PushAirdrop {
        ...PushAirdropFragment
      }
    }
  }
`,
  [StandardAirdropFragment, VestingAirdropFragment, PushAirdropFragment]
);

/**
 * GraphQL query to fetch airdrop recipients from The Graph by IDs
 *
 * @remarks
 * Used to get claim status and timing information for specific airdrop recipients
 */
const AirdropRecipientsByIds = theGraphGraphqlKit(
  `
  query AirdropRecipientsByIds($ids: [String!]!) {
    airdropRecipients(where: { id_in: $ids }) {
      ...AirdropClaimFragment
    }
  }
`,
  [AirdropClaimFragment]
);

/**
 * Fetches a list of airdrops from Hasura where the specified user is a recipient
 *
 * @param recipient - The address of the user to filter airdrop distributions by
 * @remarks
 * This function fetches data from both Hasura (off-chain distribution data) and
 * The Graph (on-chain airdrop and asset data) to provide a complete view of
 * airdrop distributions where the user is eligible to claim tokens.
 * Includes complete airdrop details, distribution amount, index, claim status,
 * and user-specific vesting data for vesting airdrops.
 */
export const getAirdropRecipientList = withTracing(
  "queries",
  "getAirdropRecipientList",
  async (recipient: Address): Promise<AirdropRecipient[]> => {
    // "use cache";
    // cacheTag("airdrop");

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

        // Create recipient IDs for The Graph query (airdropId-recipientAddress format)
        const recipientIds = distributions.map((d) =>
          `${d.airdrop}-${recipient}`.toLowerCase()
        );

        // Fetch both airdrop details and recipient claim status concurrently
        const [airdropDetailsResult, airdropRecipientsResult] =
          await Promise.all([
            theGraphClientKit.request(
              AirdropDetailsByIds,
              { ids: uniqueAirdropIds },
              {
                "X-GraphQL-Operation-Name": "AirdropDetailsByIds",
                "X-GraphQL-Operation-Type": "query",
              }
            ),
            theGraphClientKit.request(
              AirdropRecipientsByIds,
              { ids: recipientIds },
              {
                "X-GraphQL-Operation-Name": "AirdropRecipientsByIds",
                "X-GraphQL-Operation-Type": "query",
              }
            ),
          ]);

        const airdropDataMap = new Map<
          Address,
          ResultOf<typeof AirdropDetailsByIds>["airdrops"][number]
        >();
        airdropDetailsResult.airdrops.forEach((airdrop) => {
          airdropDataMap.set(getAddress(airdrop.id), airdrop);
        });

        const recipientDataMap = new Map<
          string,
          ResultOf<typeof AirdropRecipientsByIds>["airdropRecipients"][number]
        >();
        airdropRecipientsResult.airdropRecipients.forEach((recipient) => {
          recipientDataMap.set(recipient.id, recipient);
        });

        // Combine distribution data with complete airdrop information and claim status
        const recipientDataWithAirdropDetails = distributions.map((item) => {
          const airdropData = airdropDataMap.get(getAddress(item.airdrop));
          if (!airdropData) {
            throw new Error(
              `Airdrop data not found for airdrop ${item.airdrop}`
            );
          }

          // Get claim status from The Graph
          const recipientId = `${item.airdrop}-${recipient}`.toLowerCase();
          const recipientClaimData = safeParse(
            AirdropClaimSchema,
            recipientDataMap.get(recipientId)
          );

          // Get user vesting data if this is a vesting airdrop
          let userVestingData = null;
          if (airdropData.type === "VestingAirdrop") {
            const vestingAirdrop = airdropData;
            // Filter the vestingData array for the current user
            if (vestingAirdrop.strategy?.vestingData) {
              userVestingData =
                vestingAirdrop.strategy.vestingData.find(
                  (vd) => getAddress(vd.user.id) === getAddress(recipient)
                ) || null;
            }
          }

          return {
            airdrop: {
              ...airdropData,
              claimed: recipientClaimData?.firstClaimedTimestamp,
              claimData: recipientClaimData,
              userVestingData,
            },
            amount: item.amount,
            index: item.index,
          };
        });

        return recipientDataWithAirdropDetails;
      }
    );

    return safeParse(t.Array(AirdropRecipientSchema), airdropDistributions);
  }
);

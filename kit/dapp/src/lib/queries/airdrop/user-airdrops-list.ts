import "server-only";

import { fetchAllTheGraphPages } from "@/lib/pagination";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { t } from "@/lib/utils/typebox";
import { safeParse } from "@/lib/utils/typebox/index";
import type { ResultOf } from "@settlemint/sdk-thegraph";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getAddress, type Address } from "viem";
import { PushAirdropFragment } from "../push-airdrop/push-airdrop-fragment";
import { StandardAirdropFragment } from "../standard-airdrop/standard-airdrop-fragment";
import { VestingAirdropFragment } from "../vesting-airdrop/vesting-airdrop-fragment";
import { AirdropClaimFragment } from "./airdrop-fragment";
import { getUserAirdropDistributionList } from "./user-airdrop-distribution";
import {
  AirdropClaimSchema,
  UserAirdropSchema,
  type UserAirdrop,
  type UserVestingData,
} from "./user-airdrop-schema";

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
export const getUserAirdropList = withTracing(
  "queries",
  "getUserAirdropList",
  async (recipient: Address): Promise<UserAirdrop[]> => {
    "use cache";
    cacheTag("airdrop");

    const distributions = await getUserAirdropDistributionList(recipient);
    const uniqueAirdropIds = [...new Set(distributions.map((d) => d.airdrop))];

    // Create recipient IDs for The Graph query (airdropId-recipientAddress format)
    const recipientIds = distributions.map((d) =>
      `${d.airdrop}-${recipient}`.toLowerCase()
    );

    // Fetch both airdrop details and recipient claim status concurrently
    const [airdropDetailsResult, airdropRecipientsResult] = await Promise.all([
      fetchAllTheGraphPages(async (limit, offset) => {
        const result = await theGraphClientKit.request(
          AirdropDetailsByIds,
          { ids: uniqueAirdropIds, limit, offset },
          {
            "X-GraphQL-Operation-Name": "AirdropDetailsByIds",
            "X-GraphQL-Operation-Type": "query",
          }
        );
        return result.airdrops;
      }),
      fetchAllTheGraphPages(async (limit, offset) => {
        const result = await theGraphClientKit.request(AirdropRecipientsByIds, {
          ids: recipientIds,
          limit,
          offset,
        });
        return result.airdropRecipients;
      }),
    ]);

    const airdropDataMap = new Map<
      Address,
      ResultOf<typeof AirdropDetailsByIds>["airdrops"][number]
    >();
    airdropDetailsResult.forEach((airdrop) => {
      airdropDataMap.set(getAddress(airdrop.id), airdrop);
    });

    const recipientDataMap = new Map<
      string,
      ResultOf<typeof AirdropRecipientsByIds>["airdropRecipients"][number]
    >();
    airdropRecipientsResult.forEach((recipient) => {
      recipientDataMap.set(recipient.id, recipient);
    });

    // Combine distribution data with complete airdrop information and claim status
    const recipientDataWithAirdropDetails = distributions.map((item) => {
      const airdropData = airdropDataMap.get(getAddress(item.airdrop));
      if (!airdropData) {
        throw new Error(`Airdrop data not found for airdrop ${item.airdrop}`);
      }

      // Get claim status from The Graph
      const recipientId = `${item.airdrop}-${recipient}`.toLowerCase();
      const recipientClaimData = safeParse(
        AirdropClaimSchema,
        recipientDataMap.get(recipientId)
      );

      // Get user vesting data if this is a vesting airdrop
      let userVestingData: UserVestingData = null;
      if (airdropData.type === "VestingAirdrop") {
        if (airdropData.strategy?.vestingData) {
          userVestingData = airdropData.strategy.vestingData.find(
            (vd) => getAddress(vd.user.id) === getAddress(recipient)
          );
        }
      }

      return {
        ...item,
        airdrop: {
          ...airdropData,
          claimed: recipientClaimData?.firstClaimedTimestamp,
          claimData: recipientClaimData,
          userVestingData,
        },
      };
    });

    return safeParse(
      t.Array(UserAirdropSchema),
      recipientDataWithAirdropDetails
    );
  }
);

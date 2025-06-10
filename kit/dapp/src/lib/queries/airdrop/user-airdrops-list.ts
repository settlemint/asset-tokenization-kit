import "server-only";

import { fetchAllTheGraphPages } from "@/lib/pagination";
import {
  AirdropFragment,
  AirdropRecipientFragment,
} from "@/lib/queries/airdrop/airdrop-fragment";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse, t } from "@/lib/utils/typebox/index";
import type { ResultOf } from "@settlemint/sdk-thegraph";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getAddress, type Address } from "viem";
import { calculatePushAirdropStatus } from "../push-airdrop/push-airdrop-status";
import { calculateStandardAirdropStatus } from "../standard-airdrop/standard-airdrop-status";
import { calculateVestingAirdropStatus } from "../vesting-airdrop/vesting-airdrop-status";
import { getUserAirdropDistributionList } from "./user-airdrop-distribution";
import { UserAirdropSchema } from "./user-airdrop-schema";

/**
 * GraphQL query to fetch airdrop details from The Graph by IDs
 *
 * @remarks
 * Used to get complete airdrop information including asset details and type-specific fields
 */
const AirdropDetailsByIds = theGraphGraphqlKit(
  `
  query AirdropDetailsByIds($ids: [Bytes!], $user: String!) {
    airdrops(where: { id_in: $ids }) {
      ...AirdropFragment
      recipients(where: { recipient: $user }) {
        ...AirdropRecipientFragment
      }
        ... on StandardAirdrop {
          startTime
          endTime
        }
        ... on VestingAirdrop {
          claimPeriodEnd
          strategy {
            ... on LinearVestingStrategy {
              vestingDuration
              cliffDuration
            }
          }
        }
        ... on PushAirdrop {
          distributionCap
          totalDistributed
        }
    }
  }
`,
  [AirdropFragment, AirdropRecipientFragment]
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
  async (user: Address) => {
    "use cache";
    cacheTag("airdrop");

    const distributions = await getUserAirdropDistributionList(user);
    const totalAmountAllocatedMap = new Map<
      string,
      { amount: string; amountExact: string }
    >();
    for (const distribution of distributions) {
      totalAmountAllocatedMap.set(distribution.airdrop, {
        amount: distribution.amount,
        amountExact: distribution.amountExact,
      });
    }
    const uniqueAirdropIds = Array.from(totalAmountAllocatedMap.keys());

    // Fetch both airdrop details and recipient claim status concurrently
    const airdropDetailsResult = await fetchAllTheGraphPages(
      async (limit, offset) => {
        const result = await theGraphClientKit.request(
          AirdropDetailsByIds,
          {
            ids: uniqueAirdropIds,
            user: user.toLowerCase(),
            limit,
            offset,
          },
          {
            "X-GraphQL-Operation-Name": "AirdropDetailsByIds",
            "X-GraphQL-Operation-Type": "query",
          }
        );
        return result.airdrops;
      }
    );

    const result = airdropDetailsResult.map((airdrop) => {
      return {
        ...airdrop,
        status: getStatus(airdrop),
        recipient: getRecipient(airdrop, totalAmountAllocatedMap),
      };
    });

    return safeParse(t.Array(UserAirdropSchema), result);
  }
);

function getRecipient(
  airdrop: ResultOf<typeof AirdropDetailsByIds>["airdrops"][number],
  totalAmountAllocatedMap: Map<string, { amount: string; amountExact: string }>
) {
  const base = {
    totalAmountAllocated: totalAmountAllocatedMap.get(getAddress(airdrop.id))
      ?.amount,
    totalAmountAllocatedExact: totalAmountAllocatedMap.get(
      getAddress(airdrop.id)
    )?.amountExact,
  };
  return airdrop.recipients.length === 1
    ? {
        ...airdrop.recipients[0],
        ...base,
      }
    : base;
}

function getStatus(
  airdrop: ResultOf<typeof AirdropDetailsByIds>["airdrops"][number]
) {
  if (airdrop.type === "StandardAirdrop") {
    return calculateStandardAirdropStatus({
      startTimeMicroSeconds: airdrop.startTime,
      endTimeMicroSeconds: airdrop.endTime,
    });
  }
  if (airdrop.type === "VestingAirdrop") {
    return calculateVestingAirdropStatus({
      claimPeriodEndMicroSeconds: airdrop.claimPeriodEnd,
      vestingDurationSeconds: airdrop.strategy.vestingDuration,
      cliffDurationSeconds: airdrop.strategy.cliffDuration,
    });
  }
  return calculatePushAirdropStatus({
    distributionCap: airdrop.distributionCap,
    totalDistributed: airdrop.totalDistributed,
  });
}

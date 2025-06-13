import "server-only";

import type { User } from "@/lib/auth/types";
import {
  AirdropClaimIndexFragment,
  AirdropRecipientFragment,
} from "@/lib/queries/airdrop/airdrop-fragment";
import { getUserAirdropDistribution } from "@/lib/queries/airdrop/user-airdrop-distribution";
import { getAssetsPricesInUserCurrency } from "@/lib/queries/asset-price/asset-price";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox";
import type { ResultOf } from "@settlemint/sdk-thegraph";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { cache } from "react";
import type { Address } from "viem";
import { getAddress } from "viem";
import { VestingAirdropFragment } from "./vesting-airdrop-fragment";
import { UserVestingAirdropSchema } from "./vesting-airdrop-schema";
import { calculateVestingAirdropStatus } from "./vesting-airdrop-status";

/**
 * GraphQL query to fetch on-chain vesting airdrop details from The Graph
 */
const AirdropDetails = theGraphGraphqlKit(
  `
  query VestingAirdropDetail($airdrop: ID!, $user: String!) {
    vestingAirdrop(id: $airdrop) {
      ...VestingAirdropFragment
      recipients(where: { recipient: $user }) {
        ...AirdropRecipientFragment
        claimIndices {
          ...AirdropClaimIndexFragment
        }
      }
    }
  }
`,
  [VestingAirdropFragment, AirdropRecipientFragment, AirdropClaimIndexFragment]
);

/**
 * Fetches and combines on-chain and off-chain vesting airdrop data
 *
 * @param params - Object containing the vesting airdrop address
 * @returns Combined vesting airdrop data
 * @throws Error if fetching or parsing fails
 */
export const getUserVestingAirdropDetail = withTracing(
  "queries",
  "getUserVestingAirdropDetail",
  cache(async (airdrop: Address, user: User) => {
    "use cache";
    cacheTag("airdrop");

    const distributions = await getUserAirdropDistribution(
      airdrop,
      user.wallet
    );
    const amountIndexMap = new Map<
      bigint,
      { amount: string; amountExact: string }
    >();
    let totalAmountAllocated = 0;
    let totalAmountAllocatedExact = 0n;
    for (const distribution of distributions) {
      amountIndexMap.set(BigInt(distribution.index), {
        amount: distribution.amount,
        amountExact: distribution.amountExact,
      });
      totalAmountAllocated += parseFloat(distribution.amount);
      totalAmountAllocatedExact += BigInt(distribution.amountExact);
    }

    // Fetch both airdrop details and recipient claim status concurrently
    const airdropDetails = await theGraphClientKit.request(
      AirdropDetails,
      {
        airdrop,
        user: user.wallet,
      },
      {
        "X-GraphQL-Operation-Name": "AirdropDetails",
        "X-GraphQL-Operation-Type": "query",
      }
    );

    if (!airdropDetails.vestingAirdrop) {
      throw new Error(`Airdrop not found for address ${airdrop}`);
    }

    const recipient = {
      totalAmountAllocated,
      totalAmountAllocatedExact,
      claimIndices: getClaimIndices(
        airdropDetails.vestingAirdrop,
        amountIndexMap
      ),
    };
    const claimIndices = getClaimIndices(
      airdropDetails.vestingAirdrop,
      amountIndexMap
    );
    const assetPrices = await getAssetsPricesInUserCurrency(
      [airdropDetails.vestingAirdrop.asset.id],
      user.currency
    );
    const price = assetPrices.get(
      getAddress(airdropDetails.vestingAirdrop.asset.id)
    );
    const status = calculateVestingAirdropStatus({
      claimPeriodEndMicroSeconds: airdropDetails.vestingAirdrop.claimPeriodEnd,
      vestingDurationSeconds:
        airdropDetails.vestingAirdrop.strategy.vestingDuration,
      cliffDurationSeconds:
        airdropDetails.vestingAirdrop.strategy.cliffDuration,
    });

    return safeParse(UserVestingAirdropSchema, {
      ...airdropDetails.vestingAirdrop,
      recipient,
      status,
      claimIndices,
      price,
    });
  })
);

function getClaimIndices(
  airdrop: NonNullable<ResultOf<typeof AirdropDetails>["vestingAirdrop"]>,
  amountIndexMap: Map<bigint, { amount: string; amountExact: string }>
) {
  const result = [];
  const recipient =
    airdrop.recipients.length === 1 ? airdrop.recipients[0] : null;
  for (const [index, value] of amountIndexMap.entries()) {
    const claim = recipient?.claimIndices.find(
      (claim) => claim.index === index.toString()
    );
    if (claim) {
      const claimIndex = BigInt(claim.index);
      result.push({
        index: claimIndex,
        amount: amountIndexMap.get(claimIndex)?.amount,
        amountExact: amountIndexMap.get(claimIndex)?.amountExact,
        timestamp: claim.timestamp,
        claimedAmount: claim.claimedAmount,
        claimedAmountExact: claim.claimedAmountExact,
        initialized: claim.initialized,
      });
    } else {
      result.push({
        index: index,
        amount: value.amount,
        amountExact: value.amountExact,
      });
    }
  }
  return result;
}

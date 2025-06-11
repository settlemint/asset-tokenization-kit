import "server-only";

import type { User } from "@/lib/auth/types";
import {
  AirdropClaimIndexFragment,
  AirdropRecipientFragment,
} from "@/lib/queries/airdrop/airdrop-fragment";
import { getUserAirdropDistribution } from "@/lib/queries/airdrop/user-airdrop-distribution";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox";
import type { ResultOf } from "@settlemint/sdk-thegraph";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getAddress, type Address } from "viem";
import { getAssetsPricesInUserCurrency } from "../asset-price/asset-price";
import { StandardAirdropFragment } from "./standard-airdrop-fragment";
import { UserStandardAirdropSchema } from "./standard-airdrop-schema";
import { calculateStandardAirdropStatus } from "./standard-airdrop-status";

/**
 * GraphQL query to fetch airdrop details from The Graph by IDs
 *
 * @remarks
 * Used to get complete airdrop information including asset details and type-specific fields
 */
const AirdropDetails = theGraphGraphqlKit(
  `
  query AirdropDetails($airdrop: ID!, $user: String!) {
    standardAirdrop(id: $airdrop) {
      ...StandardAirdropFragment
      recipients(where: { recipient: $user }) {
        ...AirdropRecipientFragment
        claimIndices {
          ...AirdropClaimIndexFragment
        }
      }
    }
  }
`,
  [StandardAirdropFragment, AirdropRecipientFragment, AirdropClaimIndexFragment]
);

export const getUserStandardAirdropDetail = withTracing(
  "queries",
  "getUserStandardAirdropDetail",
  async (airdrop: Address, user: User) => {
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

    if (!airdropDetails.standardAirdrop) {
      throw new Error(`Airdrop not found for address ${airdrop}`);
    }

    const recipient = {
      totalAmountAllocated,
      totalAmountAllocatedExact,
      claimIndices: getClaimIndices(
        airdropDetails.standardAirdrop,
        amountIndexMap
      ),
    };
    const claimIndices = getClaimIndices(
      airdropDetails.standardAirdrop,
      amountIndexMap
    );
    const assetPrices = await getAssetsPricesInUserCurrency(
      [airdropDetails.standardAirdrop.asset.id],
      user.currency
    );
    const price = assetPrices.get(
      getAddress(airdropDetails.standardAirdrop.asset.id)
    );
    const status = calculateStandardAirdropStatus({
      startTimeMicroSeconds: airdropDetails.standardAirdrop.startTime,
      endTimeMicroSeconds: airdropDetails.standardAirdrop.endTime,
    });

    return safeParse(UserStandardAirdropSchema, {
      ...airdropDetails.standardAirdrop,
      recipient,
      status,
      claimIndices,
      price,
    });
  }
);

function getClaimIndices(
  airdrop: NonNullable<ResultOf<typeof AirdropDetails>["standardAirdrop"]>,
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

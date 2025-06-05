import "server-only";

import type { User } from "@/lib/auth/types";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox/index";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getAddress, type Address } from "viem";
import { getAssetsPricesInUserCurrency } from "../asset-price/asset-price";
import { PushAirdropFragment } from "../push-airdrop/push-airdrop-fragment";
import { StandardAirdropFragment } from "../standard-airdrop/standard-airdrop-fragment";
import { VestingAirdropFragment } from "../vesting-airdrop/vesting-airdrop-fragment";
import { AirdropClaimFragment } from "./airdrop-fragment";
import { getUserAirdropDistribution } from "./user-airdrop-distribution";
import {
  AirdropClaimSchema,
  UserAirdropDetailSchema,
  type UserVestingData,
} from "./user-airdrop-schema";

/**
 * GraphQL query to fetch a specific airdrop details from The Graph by ID
 *
 * @remarks
 * Used to get complete airdrop information including asset details and type-specific fields
 */
const AirdropDetailById = theGraphGraphqlKit(
  `
  query AirdropDetailById($id: ID!) {
    airdrop(id: $id) {
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
 * GraphQL query to fetch a specific airdrop recipient from The Graph by ID
 *
 * @remarks
 * Used to get claim status and timing information for a specific airdrop recipient
 */
const AirdropRecipientById = theGraphGraphqlKit(
  `
  query AirdropRecipientById($id: ID!) {
    airdropRecipient(id: $id) {
      ...AirdropClaimFragment
    }
  }
`,
  [AirdropClaimFragment]
);

/**
 * Fetches detailed information for a specific airdrop and recipient combination
 *
 * @param airdropAddress - The address of the airdrop contract
 * @param recipient - The address of the user to get airdrop details for
 * @returns Promise<AirdropRecipient | null> - The airdrop recipient details or null if not found
 * @remarks
 * This function fetches data from both Hasura (off-chain distribution data) and
 * The Graph (on-chain airdrop and asset data) to provide a complete view of
 * a specific airdrop distribution where the user is eligible to claim tokens.
 * Includes complete airdrop details, distribution amount, index, claim status,
 * and user-specific vesting data for vesting airdrops.
 */
export const getUserAirdropDetail = withTracing(
  "queries",
  "getAirdropRecipientDetail",
  async (airdropAddress: Address, recipient: User) => {
    "use cache";
    cacheTag("airdrop");

    const distribution = await getUserAirdropDistribution(
      airdropAddress,
      recipient
    );

    // Create recipient ID for The Graph query (airdropId-recipientAddress format)
    const recipientId = `${airdropAddress}-${recipient}`.toLowerCase();

    // Fetch both airdrop details and recipient claim status concurrently
    const [airdropDetailsResult, airdropRecipientResult] = await Promise.all([
      theGraphClientKit.request(
        AirdropDetailById,
        { id: airdropAddress },
        {
          "X-GraphQL-Operation-Name": "AirdropDetailById",
          "X-GraphQL-Operation-Type": "query",
        }
      ),
      theGraphClientKit.request(
        AirdropRecipientById,
        { id: recipientId },
        {
          "X-GraphQL-Operation-Name": "AirdropRecipientById",
          "X-GraphQL-Operation-Type": "query",
        }
      ),
    ]);

    if (!airdropDetailsResult.airdrop) {
      throw new Error(`Airdrop data not found for airdrop ${airdropAddress}`);
    }

    const airdrop = airdropDetailsResult.airdrop;

    const assetPrices = await getAssetsPricesInUserCurrency(
      [airdrop.asset.id],
      recipient.currency
    );
    const assetPrice = assetPrices.get(getAddress(airdrop.asset.id));
    if (!assetPrice) {
      throw new Error(`Asset price not found for asset ${airdrop.asset.id}`);
    }

    // Get claim status from The Graph
    const recipientClaimData = safeParse(
      AirdropClaimSchema,
      airdropRecipientResult.airdropRecipient
    );

    // Get user vesting data if this is a vesting airdrop
    let userVestingData: UserVestingData = null;
    if (airdrop.type === "VestingAirdrop") {
      if (airdrop.strategy?.vestingData) {
        userVestingData = airdrop.strategy.vestingData.find(
          (vd) => getAddress(vd.user.id) === getAddress(recipient.wallet)
        );
      }
    }

    const price = Number(distribution.amount) * assetPrice.amount;

    const recipientDataWithAirdropDetails = {
      ...distribution,
      airdrop: {
        ...airdrop,
        claimed: recipientClaimData?.firstClaimedTimestamp,
        claimData: recipientClaimData,
        userVestingData,
      },
      price: {
        amount: price,
        currency: assetPrice.currency,
      },
    };

    return safeParse(UserAirdropDetailSchema, recipientDataWithAirdropDetails);
  }
);

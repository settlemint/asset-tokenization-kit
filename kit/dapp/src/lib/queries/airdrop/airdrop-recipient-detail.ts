import "server-only";

import type { User } from "@/lib/auth/types";
import { fetchAllHasuraPages } from "@/lib/pagination";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox/index";
import { getAddress, type Address } from "viem";
import { getAssetsPricesInUserCurrency } from "../asset-price/asset-price";
import { PushAirdropFragment } from "../push-airdrop/push-airdrop-fragment";
import { StandardAirdropFragment } from "../standard-airdrop/standard-airdrop-fragment";
import { VestingAirdropFragment } from "../vesting-airdrop/vesting-airdrop-fragment";
import {
  AirdropClaimFragment,
  AirdropRecipientFragment,
} from "./airdrop-recipient-fragment";
import {
  AirdropClaimSchema,
  AirdropRecipientDetailSchema,
  type UserVestingData,
} from "./airdrop-recipient-schema";

/**
 * GraphQL query to fetch a specific airdrop distribution from Hasura
 *
 * @remarks
 * Retrieves a single airdrop distribution where the user is a recipient for a specific airdrop
 */
const AirdropRecipientDetail = hasuraGraphql(
  `
  query AirdropRecipientDetail($recipient: String!, $airdrop: String!, $limit: Int, $offset: Int) {
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
export const getAirdropRecipientDetail = withTracing(
  "queries",
  "getAirdropRecipientDetail",
  async (airdropAddress: Address, recipient: User) => {
    // "use cache";
    // cacheTag("airdrop");

    const distributions = await fetchAllHasuraPages(async (limit, offset) => {
      const result = await hasuraClient.request(
        AirdropRecipientDetail,
        {
          limit,
          offset,
          recipient: recipient.wallet,
          airdrop: airdropAddress,
        },
        {
          "X-GraphQL-Operation-Name": "AirdropRecipientList",
          "X-GraphQL-Operation-Type": "query",
        }
      );

      return result.airdrop_distribution;
    });

    if (distributions.length !== 1) {
      throw new Error(`Expected 1 distribution, got ${distributions.length}`);
    }

    const distribution = distributions[0];

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

    const amountNumber = Number(
      BigInt(distribution.amount) / BigInt(10 ** airdrop.asset.decimals)
    );
    const price = amountNumber * assetPrice.amount;

    const recipientDataWithAirdropDetails = {
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
      amount: distribution.amount,
      index: distribution.index,
    };

    return safeParse(
      AirdropRecipientDetailSchema,
      recipientDataWithAirdropDetails
    );
  }
);

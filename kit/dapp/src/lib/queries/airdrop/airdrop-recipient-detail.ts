import "server-only";

import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox/index";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { cache } from "react";
import type { Address } from "viem";
import { AirdropFragment } from "./airdrop-fragment";
import { AirdropRecipientFragment } from "./airdrop-recipient-fragment";
import {
  AirdropRecipientSchema,
  type AirdropRecipient,
} from "./airdrop-recipient-schema";
import { OnChainAirdropSchema } from "./airdrop-schema";

/**
 * GraphQL query to fetch specific airdrop recipient detail from Hasura
 */
const AirdropRecipientDetailQuery = hasuraGraphql(
  `
  query AirdropRecipientDetail($airdrop: String!, $recipient: String!) {
    airdrop_distribution(
      where: {
        airdrop_id: { _eq: $airdrop }
        recipient: { _eq: $recipient }
      }
    ) {
      ...AirdropRecipientFragment
    }
  }
`,
  [AirdropRecipientFragment]
);

/**
 * GraphQL query to fetch airdrop details from The Graph by ID
 */
const AirdropDetailQuery = theGraphGraphqlKit(
  `
  query AirdropDetail($id: ID!) {
    airdrop(id: $id) {
      ...AirdropFragment
    }
  }
`,
  [AirdropFragment]
);

/**
 * Props interface for airdrop recipient detail components
 */
export interface AirdropRecipientDetailProps {
  /** Ethereum address of the airdrop contract */
  airdropAddress: Address;
  /** Ethereum address of the recipient */
  recipientAddress: Address;
}

/**
 * Fetches detailed information about a specific airdrop recipient
 *
 * @param params - Object containing the airdrop address and recipient address
 * @returns Combined airdrop recipient data with complete airdrop information
 * @throws Error if recipient is not found or if fetching/parsing fails
 */
export const getAirdropRecipientDetail = withTracing(
  "queries",
  "getAirdropRecipientDetail",
  cache(
    async ({
      airdropAddress,
      recipientAddress,
    }: AirdropRecipientDetailProps): Promise<AirdropRecipient> => {
      "use cache";
      cacheTag("airdrop");

      // Fetch distribution data for the specific recipient
      const distributionResult = await hasuraClient.request(
        AirdropRecipientDetailQuery,
        {
          airdrop: airdropAddress,
          recipient: recipientAddress,
        },
        {
          "X-GraphQL-Operation-Name": "AirdropRecipientDetail",
          "X-GraphQL-Operation-Type": "query",
        }
      );

      if (distributionResult.airdrop_distribution.length > 1) {
        throw new Error(
          `Multiple airdrop distributions found for recipient ${recipientAddress} in airdrop ${airdropAddress}`
        );
      }

      const distribution = distributionResult.airdrop_distribution?.[0];
      if (!distribution) {
        throw new Error(
          `No airdrop distribution found for recipient ${recipientAddress} in airdrop ${airdropAddress}`
        );
      }

      // Fetch complete airdrop details from The Graph
      const airdropDetailsResult = await theGraphClientKit.request(
        AirdropDetailQuery,
        { id: airdropAddress },
        {
          "X-GraphQL-Operation-Name": "AirdropDetail",
          "X-GraphQL-Operation-Type": "query",
        }
      );

      const validatedAirdrop = safeParse(
        OnChainAirdropSchema,
        airdropDetailsResult.airdrop
      );

      if (!validatedAirdrop) {
        throw new Error(`No airdrop found with address ${airdropAddress}`);
      }

      // Combine distribution data with complete airdrop information
      const recipientDetail = {
        airdrop: validatedAirdrop,
        amount: distribution.amount,
        index: distribution.index,
        claimed: distribution.claimed,
      };

      return safeParse(AirdropRecipientSchema, recipientDetail);
    }
  )
);

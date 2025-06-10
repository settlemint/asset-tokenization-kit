import { hasuraGraphql } from "@/lib/settlemint/hasura";
import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";

/**
 * GraphQL fragment for on-chain airdrop data from The Graph
 *
 * @remarks
 * Contains core airdrop properties including ID, asset, total claimed amounts, and recipients
 */
export const AirdropFragment = theGraphGraphqlKit(`
  fragment AirdropFragment on Airdrop {
    id
    type: __typename
    asset: token {
      id
      symbol
      type
      decimals
    }
    totalClaimed
    totalClaimedExact
    totalRecipients
  }
`);

/**
 * GraphQL fragment for off-chain airdrop data from Hasura
 *
 * @remarks
 * Contains additional airdrop distribution data stored in the database
 */
export const OffchainAirdropFragment = hasuraGraphql(`
  fragment OffchainAirdropFragment on airdrop_distribution {
    airdrop: airdrop_id
    index
    recipient
    amount
    amountExact: amount_exact
  }
`);

export const AirdropClaimIndexFragment = theGraphGraphqlKit(`
  fragment AirdropClaimIndexFragment on AirdropClaimIndex {
    index
    claimedAmount: amount
    claimedAmountExact: amountExact
    timestamp
  }
`);

/**
 * GraphQL fragment for airdrop recipient data from The Graph
 *
 * @remarks
 * Contains recipient-specific claim data from on-chain events
 * Includes claim timestamps and total claimed amounts for status calculation
 */
export const AirdropRecipientFragment = theGraphGraphqlKit(
  `
  fragment AirdropRecipientFragment on AirdropRecipient {
    id
    firstClaimedTimestamp
    lastClaimedTimestamp
    totalClaimedByRecipient
    totalClaimedByRecipientExact
  }
`
);

import { hasuraGraphql } from "@/lib/settlemint/hasura";
import { OffchainAirdropFragment } from "./airdrop-fragment";

/**
 * Common GraphQL query to fetch off-chain airdrop distribution details from Hasura
 *
 * @remarks
 * This query is shared across different airdrop types (standard, vesting, push, etc.)
 * since they all have the same off-chain distribution data structure
 */
export const OffchainAirdropDistributionDetail = hasuraGraphql(
  `
  query OffchainAirdropDistributionDetail($id: String!) {
    airdrop_distribution(where: {airdrop_id: {_eq: $id}}) {
      ...OffchainAirdropFragment
    }
  }
`,
  [OffchainAirdropFragment]
);

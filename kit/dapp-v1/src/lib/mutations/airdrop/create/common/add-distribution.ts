import { hasuraGraphql } from "@/lib/settlemint/hasura";

export const AddAirdropDistribution = hasuraGraphql(`
  mutation AddAirdropDistribution($objects: [airdrop_distribution_insert_input!]!) {
    insert_airdrop_distribution(
      objects: $objects
      on_conflict: {
        constraint: airdrop_distribution_unique_constraint
        update_columns: [amount, index]
      }
    ) {
      affected_rows
      returning {
        id
        airdrop_id
        recipient
        amount
        index
      }
    }
  }
`);

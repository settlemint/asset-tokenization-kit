import { hasuraGraphql } from "@/lib/settlemint/hasura";

/**
 * GraphQL fragment for off-chain bond data from Hasura
 *
 * @remarks
 * Contains additional metadata about bonds stored in the database
 */
export const OffchainBondFragment = hasuraGraphql(`
  fragment OffchainBondFragment on asset {
    id
    isin
    valueInBaseCurrency
  }
`);

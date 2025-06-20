import { hasuraGraphql } from "@/lib/settlemint/hasura";

/**
 * GraphQL fragment for contact data from Hasura
 *
 * @remarks
 * Contains core contact properties including ID, name, wallet address, and related timestamps
 */
export const ContactFragment = hasuraGraphql(
  `
  fragment ContactFragment on contact {
    id
    wallet
    name
  }
`
);

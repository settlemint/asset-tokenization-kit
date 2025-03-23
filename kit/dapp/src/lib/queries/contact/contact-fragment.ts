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
    created_at
    user_id
    updated_at
  }
`
);

/**
 * Type definition for contact data
 */
export interface Contact {
  id: string;
  name: string;
  wallet: `0x${string}`;
  created_at: Date;
  user_id: string;
  updated_at?: Date | null;
}

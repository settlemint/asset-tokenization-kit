import { hasuraGraphql } from '@/lib/settlemint/hasura';
import { z } from '@/lib/utils/zod';

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
 * Zod schema for validating contact data
 *
 */
export const ContactFragmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  wallet: z.address(),
  created_at: z.coerce.date(),
  user_id: z.string(),
  updated_at: z.coerce.date().nullish(),
});

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

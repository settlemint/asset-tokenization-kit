import { hasuraGraphql } from "@/lib/settlemint/hasura";
import { z, type ZodInfer } from "@/lib/utils/zod";

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
  updated_at: z.coerce.date().nullish(),
  user_id: z.string(),
  lastActivity: z.string().nullish(),
});

/**
 * Type definition for contact data
 */
export type Contact = ZodInfer<typeof ContactFragmentSchema>;

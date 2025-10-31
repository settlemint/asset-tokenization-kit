import { z } from "zod";

/**
 * Input schema for deleting a contact entry.
 */
export const ContactsDeleteSchema = z.object({
  id: z.uuid(),
});

/**
 * Output schema for delete operation acknowledgement.
 */
export const ContactsDeleteOutputSchema = z.object({
  success: z.literal(true),
});

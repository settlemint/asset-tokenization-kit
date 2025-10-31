import { ContactSchema } from "@/orpc/routes/contacts/routes/contacts.record.schema";
import { z } from "zod";

/**
 * Input schema for quick contact search.
 */
export const ContactsSearchSchema = z.object({
  query: z
    .string()
    .min(1)
    .max(120)
    .describe("Case-insensitive search across contact name and wallet"),
  limit: z.number().int().positive().max(50).default(10),
});

/**
 * Lightweight search result schema.
 */
export const ContactsSearchOutputSchema = ContactSchema.pick({
  id: true,
  name: true,
  wallet: true,
}).array();

export type ContactsSearchResult = z.infer<typeof ContactsSearchOutputSchema>;

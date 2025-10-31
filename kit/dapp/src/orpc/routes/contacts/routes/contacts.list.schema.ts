import { PaginatedListSchema } from "@/orpc/routes/common/schemas/paginated-list.schema";
import { ContactSchema } from "@/orpc/routes/contacts/routes/contacts.record.schema";
import { z } from "zod";

/**
 * Input schema for paginated contact listing.
 *
 * Extends the base pagination schema with contact-specific filters
 * and restricts the allowed sort columns.
 */
export const ContactsListInputSchema = PaginatedListSchema.extend({
  orderBy: z
    .enum(["createdAt", "updatedAt", "name", "wallet"])
    .default("createdAt"),
  filters: z
    .object({
      search: z
        .string()
        .min(1)
        .max(120)
        .optional()
        .describe("Case-insensitive match against name or wallet address"),
    })
    .optional(),
});

/**
 * Output schema for contact listing.
 *
 * Returns paginated contact entries for the authenticated user.
 */
export const ContactsListOutputSchema = z.object({
  items: ContactSchema.array(),
  total: z.number(),
  limit: z.number().optional(),
  offset: z.number(),
});

export type ContactsListInput = z.infer<typeof ContactsListInputSchema>;
export type ContactsListOutput = z.infer<typeof ContactsListOutputSchema>;

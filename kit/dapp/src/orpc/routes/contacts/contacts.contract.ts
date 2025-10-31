import { baseContract } from "@/orpc/procedures/base.contract";
import { ContactsDeleteOutputSchema } from "@/orpc/routes/contacts/routes/contacts.delete.schema";
import {
  ContactsListInputSchema,
  ContactsListOutputSchema,
} from "@/orpc/routes/contacts/routes/contacts.list.schema";
import {
  ContactsSearchOutputSchema,
  ContactsSearchSchema,
} from "@/orpc/routes/contacts/routes/contacts.search.schema";
import { ContactSchema } from "@/orpc/routes/contacts/routes/contacts.record.schema";
import { ContactsUpsertSchema } from "@/orpc/routes/contacts/routes/contacts.upsert.schema";
import { ContactsDeleteSchema } from "./routes/contacts.delete.schema";

/**
 * Contract definition for listing contacts.
 */
const list = baseContract
  .route({
    method: "GET",
    path: "/contacts",
    description: "List contacts for the authenticated user",
    successDescription: "Contacts retrieved successfully",
    tags: ["contacts"],
  })
  .input(ContactsListInputSchema)
  .output(ContactsListOutputSchema);

/**
 * Contract definition for contact creation or update.
 */
const upsert = baseContract
  .route({
    method: "POST",
    path: "/contacts",
    description: "Create or update a contact entry",
    successDescription: "Contact saved successfully",
    tags: ["contacts"],
  })
  .input(ContactsUpsertSchema)
  .output(ContactSchema);

/**
 * Contract definition for deleting a contact.
 */
const del = baseContract
  .route({
    method: "DELETE",
    path: "/contacts/:id",
    description: "Delete a contact entry",
    successDescription: "Contact deleted successfully",
    tags: ["contacts"],
  })
  .input(ContactsDeleteSchema)
  .output(ContactsDeleteOutputSchema);

/**
 * Contract definition for searching contacts.
 */
const search = baseContract
  .route({
    method: "GET",
    path: "/contacts/search",
    description: "Search contacts by name or wallet address",
    successDescription: "Contact search completed successfully",
    tags: ["contacts"],
  })
  .input(ContactsSearchSchema)
  .output(ContactsSearchOutputSchema);

/**
 * Contacts contract collection.
 */
export const contactsContract = {
  list,
  upsert,
  delete: del,
  search,
};

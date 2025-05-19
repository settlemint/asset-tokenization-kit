"use server";
import { ContactSchema } from "@/lib/queries/contact/contact-schema";
import { action } from "../safe-action";
import { addContactFunction } from "./add-contact-function";
import { getAddContactFormSchema } from "./add-contact-schema";

export const addContact = action
  .schema(getAddContactFormSchema())
  .outputSchema(ContactSchema)
  .action(addContactFunction);

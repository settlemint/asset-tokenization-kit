"use server";
import { t } from "@/lib/utils/typebox";
import { action } from "../safe-action";
import { addContactFunction } from "./add-contact-function";
import { getAddContactFormSchema } from "./add-contact-schema";

export const addContact = action
  .schema(getAddContactFormSchema())
  .outputSchema(t.Array(t.String()))
  .action(addContactFunction);

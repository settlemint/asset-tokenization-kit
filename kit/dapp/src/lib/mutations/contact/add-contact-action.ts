"use server";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { nanoid } from "nanoid";
import { action } from "../safe-action";
import {
  AddContactOutputSchema,
  getAddContactFormSchema,
} from "./add-contact-schema";

const AddContact = hasuraGraphql(`
  mutation AddContact($address: String!, $name: String!, $id: String!, $userId: String!) {
    insert_contact_one(
      object: {
        id: $id,
        wallet: $address,
        name: $name,
        user_id: $userId,
      }
    ) {
      id
    }
  }
`);

export const addContact = action
  .schema(getAddContactFormSchema())
  .outputSchema(AddContactOutputSchema)
  .action(
    async ({
      parsedInput: { address, firstName, lastName },
      ctx: { user },
    }) => {
      const data = await hasuraClient.request(AddContact, {
        id: nanoid(),
        address: address,
        name: `${firstName} ${lastName}`,
        userId: user.id,
      });

      const contact = data?.insert_contact_one?.id;
      if (!contact) {
        throw new Error("Failed to add contact");
      }

      return contact;
    }
  );

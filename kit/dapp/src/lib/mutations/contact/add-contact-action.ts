'use server';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';
import { action } from '../safe-action';
import {
  AddContactOutputSchema,
  getAddContactFormSchema,
} from './add-contact-schema';

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
`) as TypedDocumentNode<
  { insert_contact_one: { id: string } },
  { address: string; name: string; id: string; userId: string }
>;

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
        throw new Error('Failed to add contact');
      }

      // Revalidate the contacts page to show the new contact
      revalidatePath('/portfolio/my-contacts');

      // Since this is a non-blockchain operation, return a dummy transaction hash
      // that matches the format expected by the form
      return [
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      ];
    }
  );

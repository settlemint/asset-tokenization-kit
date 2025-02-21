'use server';
import { actionClient } from '@/lib/safe-action';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import {} from 'viem';
import { AddContactOutputSchema, getAddContactFormSchema } from './schema';

const AddContact = hasuraGraphql(`
  mutation AddContact( $address: String!, $name: String!) {
    insert_user (
      objects: [
        {
          wallet: $address,
          name: $name,
          created_at: "now()"
        }
      ]
    )
     {
      returning {
        id
      }
    }
  }
`);

export const addContact = actionClient
  .schema(getAddContactFormSchema())
  .outputSchema(AddContactOutputSchema)
  .action(async ({ parsedInput: { address, firstName, lastName }, ctx: { user } }) => {
    const data = await hasuraClient.request(getQuery(), {
      address: address,
      name: `${firstName} ${lastName}`,
    });

    const contact = data?.insert_user?.returning[0]?.id;
    if (!contact) {
      throw new Error('Failed to add contact');
    }

    return contact;
  });

function getQuery() {
  return AddContact;
}

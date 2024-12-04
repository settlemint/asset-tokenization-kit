'use server';

import { auth } from '@/lib/auth/auth';
import { actionClient } from '@/lib/safe-action';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { CreateAddressBookEntrySchema } from './create-address-book-entry-schema';

const CreateAddressBookEntryMutation = hasuraGraphql(`
mutation CreateAddressBookEntry($address: String!, $name: String!, $walletAddress: String!) {
  insert_starterkit_addressbook_one(object: {address: $address, name: $name, walletAddress: $walletAddress}) {
    name
    walletAddress
  }
}
`);

export const createAddressBookEntryAction = actionClient
  .schema(CreateAddressBookEntrySchema)
  .action(async ({ parsedInput }) => {
    const { walletAddress, walletName } = parsedInput;
    const session = await auth();

    if (!session?.user) {
      throw new Error('User not authenticated');
    }

    const result = await hasuraClient.request(CreateAddressBookEntryMutation, {
      address: session.user.wallet,
      name: walletName,
      walletAddress: walletAddress,
    });

    return result;
  });

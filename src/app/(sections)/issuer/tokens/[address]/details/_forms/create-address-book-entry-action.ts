"use server";

import { auth } from "@/lib/auth/auth";
import { actionClient } from "@/lib/safe-action";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { CreateAddressBookEntrySchema } from "./create-address-book-entry-schema";

const CreateAddressBookEntryMutation = hasuraGraphql(`
mutation CreateAddressBookEntry($walletName: String!, $from: String!, $walletAddress: String!) {
  insert_starterkit_addressbookentry_one(
    from: $from
    input: {walletName: $walletName, walletAddress: $walletAddress}
  ) {
    id
    walletAddress
    walletName
  }
}
`);

export const createAddressBookEntryAction = actionClient
  .schema(CreateAddressBookEntrySchema)
  .action(async ({ parsedInput }) => {
    const { walletAddress, walletName } = parsedInput;
    const session = await auth();

    if (!session?.user) {
      throw new Error("User not authenticated");
    }

    const result = await hasuraClient.request(CreateAddressBookEntryMutation, {
      from: session.user.wallet,
      walletAddress: walletAddress as string,
      walletName,
    });

    return result;
  });

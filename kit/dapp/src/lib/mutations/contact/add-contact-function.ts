import type { User } from "@/lib/auth/types";
import { ContactFragment } from "@/lib/queries/contact/contact-fragment";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { revalidatePath } from "next/cache";
import type { AddContactFormType } from "./add-contact-schema";

/**
 * GraphQL mutation for adding a contact
 */
const AddContact = hasuraGraphql(
  `
  mutation AddContact($address: String!, $name: String!, $id: String!, $userId: String!) {
    insert_contact_one(
      object: {
        id: $id,
        wallet: $address,
        name: $name,
        user_id: $userId,
      }
    ) {
      ...ContactFragment
    }
  }
`,
  [ContactFragment]
);

/**
 * Function to add a contact to the user's contact list
 *
 * @param input - Validated input for adding a contact
 * @param user - The user adding the contact
 * @returns An array containing a mock transaction hash
 */
export async function addContactFunction({
  parsedInput: { address, firstName, lastName },
  ctx: { user },
}: {
  parsedInput: AddContactFormType;
  ctx: { user: User };
}) {
  try {
    const data = await hasuraClient.request(AddContact, {
      id: crypto.randomUUID(),
      address: address,
      name: `${firstName} ${lastName}`,
      userId: user.id,
    });

    const contact = data?.insert_contact_one;
    if (!contact) {
      throw new Error("Failed to add contact: No data returned");
    }

    // Revalidate both the parent and specific route to ensure table refresh
    revalidatePath("/portfolio/my-contacts", "page");
    revalidatePath("/portfolio/my-contacts/(table)", "page");

    // Return a mock Ethereum transaction hash (0x + 64 hex chars)
    return [`0x${"0".repeat(64)}`];
  } catch (error) {
    console.error("Error adding contact:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to add contact"
    );
  }
}

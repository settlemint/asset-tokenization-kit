import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { ContactFragment } from './contact-fragment';
import type { Contact } from './contact-fragment';

/**
 * GraphQL query to fetch contact list from Hasura
 *
 * @remarks
 * Retrieves contacts ordered by creation date in descending order
 */
const ContactList = hasuraGraphql(
  `
  query ContactList($userId: String) {
    contact(where: {user_id: {_eq: $userId}}) {
        ...ContactFragment
    }
  }
`,
  [ContactFragment]
);

interface ContactListResponse {
  contact: Contact[];
}

export async function getContactsList(userId: string): Promise<Contact[]> {
  try {
    const data = await hasuraClient.request<ContactListResponse>(ContactList, {
      userId,
    });
    return data.contact || [];
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
}

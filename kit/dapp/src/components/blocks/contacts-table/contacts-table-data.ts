import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';

const ContactListFragment = hasuraGraphql(
  `
  fragment ContactListFragment on contact {
    id
    wallet
    name
    created_at
    user_id
    updated_at
  }
`
);

const ContactList = hasuraGraphql(
  `
  query ContactList($userId: String) {
    contact(where: {user_id: {_eq: $userId}}) {
        ...ContactListFragment
    }
  }
`,
  [ContactListFragment]
);

export type ContactsListItem = Awaited<ReturnType<typeof getContactsList>>[number];

export async function getContactsList(userId: string) {
  const data = await hasuraClient.request(ContactList, { userId });
  return data.contact;
}

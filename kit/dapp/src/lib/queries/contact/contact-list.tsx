import { AccountFragment } from "@/lib/queries/accounts/accounts-fragment";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";
import { ContactFragment } from "./contact-fragment";

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

/**
 * GraphQL query to fetch user activity from TheGraph
 *
 * @remarks
 * Retrieves accounts with their last activity timestamp
 */
const UserActivity = theGraphGraphqlKit(
  `
  query UserActivity($first: Int, $skip: Int) {
    accounts(where: { isContract: false }, first: $first, skip: $skip) {
      ...AccountFragment
    }
  }
`,
  [AccountFragment]
);

export type ContactsListItem = Awaited<
  ReturnType<typeof getContactsList>
>[number];

export async function getContactsList(userId: string) {
  const data = await hasuraClient.request(ContactList, { userId });
  return data.contact;
}

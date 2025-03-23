import { fetchAllHasuraPages } from "@/lib/pagination";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { t } from "@/lib/utils/typebox";
import { safeParse } from "@/lib/utils/typebox/index";
import { cache } from "react";
import { ContactFragment } from "./contact-fragment";
import { ContactSchema } from "./contact-schema";

/**
 * GraphQL query to fetch contact list from Hasura
 *
 * @remarks
 * Retrieves contacts ordered by creation date in descending order
 */
const ContactListQuery = hasuraGraphql(
  `
  query ContactList($userId: String, $limit: Int, $offset: Int) {
    contact(
      where: {user_id: {_eq: $userId}},
      order_by: {created_at: desc},
      limit: $limit,
      offset: $offset
    ) {
      ...ContactFragment
    }
  }
`,
  [ContactFragment]
);

/**
 * Fetches a list of contacts for a specific user
 *
 * @param userId - The ID of the user whose contacts to fetch
 * @returns An array of contacts belonging to the user
 */
export const getContactsList = cache(async (userId: string) => {
  const contacts = await fetchAllHasuraPages(async (pageLimit, offset) => {
    const result = await hasuraClient.request(ContactListQuery, {
      userId,
      limit: pageLimit,
      offset,
    });

    // Parse and validate the contacts with TypeBox
    return safeParse(t.Array(ContactSchema), result.contact || []);
  });

  return contacts;
});

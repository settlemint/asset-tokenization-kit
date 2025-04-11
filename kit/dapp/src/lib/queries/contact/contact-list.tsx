import { fetchAllHasuraPages } from "@/lib/pagination";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { withTracing } from "@/lib/utils/tracing";
import { t } from "@/lib/utils/typebox";
import { safeParse } from "@/lib/utils/typebox/index";
import type { VariablesOf } from "gql.tada";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { ContactFragment } from "./contact-fragment";
import { ContactSchema, type Contact } from "./contact-schema";

/**
 * GraphQL query to fetch contact list from Hasura
 *
 * @remarks
 * Retrieves contacts ordered by creation date in descending order
 */
const ContactListQuery = hasuraGraphql(
  `
  query ContactList($limit: Int, $offset: Int, $where: contact_bool_exp!) {
    contact(
      where: $where,
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
export const getContactsList = withTracing(
  "queries",
  "getContactsList",
  async (userId: string, searchTerm?: string): Promise<Contact[]> => {
    "use cache";
    cacheTag("contact");
    return fetchAllHasuraPages(async (pageLimit, offset) => {
      const where: VariablesOf<typeof ContactListQuery>["where"] = {
        user_id: { _eq: userId },
      };
      if (searchTerm) {
        const searchValue = `%${searchTerm}%`;
        where._or = [
          { name: { _ilike: searchValue } },
          { wallet: { _ilike: searchValue } },
        ];
      }

      const result = await hasuraClient.request(ContactListQuery, {
        limit: pageLimit,
        offset,
        where,
      });

      // Parse and validate the contacts with TypeBox
      return safeParse(t.Array(ContactSchema), result.contact || []);
    });
  }
);

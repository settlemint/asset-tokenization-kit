import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox/index";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { ContactFragment } from "./contact-fragment";
import { ContactSchema } from "./contact-schema";

/**
 * GraphQL query to fetch a single contact by ID
 */
const ContactDetailQuery = hasuraGraphql(
  `
  query ContactDetail($id: String!) {
    contact_by_pk(id: $id) {
      ...ContactFragment
    }
  }
`,
  [ContactFragment]
);

interface GetContactDetailParams {
  id: string;
}

/**
 * Fetches detailed information about a specific contact
 *
 * @param params - Object containing the contact ID and user ID
 * @returns Contact details or null if not found
 */
export const getContactDetail = withTracing(
  "queries",
  "getContactDetail",
  async ({ id }: GetContactDetailParams) => {
    "use cache";
    cacheTag("contact");
    const result = await hasuraClient.request(ContactDetailQuery, {
      id,
    });

    const contact = result.contact_by_pk;

    if (!contact) {
      return null;
    }

    return safeParse(ContactSchema, contact);
  }
);

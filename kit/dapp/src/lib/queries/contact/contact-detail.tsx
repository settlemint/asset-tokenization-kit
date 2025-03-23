import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { safeParse } from "@/lib/utils/typebox/index";
import { cache } from "react";
import { getAddress } from "viem";
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
  userId: string;
}

/**
 * Fetches detailed information about a specific contact
 *
 * @param params - Object containing the contact ID and user ID
 * @returns Contact details or null if not found
 */
export const getContactDetail = cache(
  async ({ id, userId }: GetContactDetailParams) => {
    try {
      const result = await hasuraClient.request(ContactDetailQuery, {
        id,
      });

      if (!result.contact_by_pk) {
        return null;
      }

      // Ensure the contact belongs to the requesting user
      if (result.contact_by_pk.user_id !== userId) {
        return null;
      }

      // Format and validate the contact data
      const formattedContact = {
        ...result.contact_by_pk,
        wallet: getAddress(result.contact_by_pk.wallet),
        created_at:
          typeof result.contact_by_pk.created_at === "string"
            ? new Date(result.contact_by_pk.created_at).toISOString()
            : null,
        updated_at:
          typeof result.contact_by_pk.updated_at === "string"
            ? new Date(result.contact_by_pk.updated_at).toISOString()
            : null,
      };

      return safeParse(ContactSchema, formattedContact);
    } catch (error) {
      console.error("Error fetching contact details:", error);
      return null;
    }
  }
);

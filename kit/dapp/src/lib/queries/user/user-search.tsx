import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { sanitizeSearchTerm } from "@/lib/utils/string";
import { safeParse, t } from "@/lib/utils/typebox";
import { cache } from "react";
import { UserFragment } from "./user-fragment";
import { UserSchema } from "./user-schema";

/**
 * GraphQL query to search for users by name, wallet address, or email
 *
 * @remarks
 * Uses case-insensitive pattern matching to find users matching the search term
 */
const UserSearch = hasuraGraphql(
  `
  query UserSearch($address: String!) {
    user(
      where: {
        _or: [
          { name: { _ilike: $address } },
          { wallet: { _ilike: $address } },
          { email: { _like: $address } }
        ]
      },
      limit: 10
    ) {
      ...UserFragment
    }
  }
`,
  [UserFragment]
);

/**
 * Props interface for user search components
 *
 */
export interface UserSearchProps {
  /** Address, name or email to search for */
  searchTerm: string;
}

/**
 * Searches for users by address, name, or email
 *
 * @param params - Object containing the search string
 * @returns Array of matching users
 * @remarks
 * Returns an empty array if no address is provided or if an error occurs
 */
export const getUserSearch = cache(async ({ searchTerm }: UserSearchProps) => {
  const sanitizedSearchTerm = sanitizeSearchTerm(searchTerm);

  if (!sanitizedSearchTerm) {
    return [];
  }

  const searchValue = `%${searchTerm}%`;
  const result = await hasuraClient.request(UserSearch, {
    address: searchValue,
  });

  // Parse and validate users using TypeBox schema
  return safeParse(t.Array(UserSchema), result.user || []);
});

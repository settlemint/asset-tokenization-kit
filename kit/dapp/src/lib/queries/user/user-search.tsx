"use server";

import { getUser } from "@/lib/auth/utils";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { sanitizeSearchTerm } from "@/lib/utils/string";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse, t } from "@/lib/utils/typebox";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { cache } from "react";
import type { User } from "../../auth/types";
import { withAccessControl } from "../../utils/access-control";
import { getContactsList } from "../contact/contact-list";
import type { Contact } from "../contact/contact-schema";
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
 * Searches for all users by address, name, or email
 *
 * @param params - Object containing the search string
 * @returns Array of matching users
 * @remarks
 * Returns an empty array if no address is provided or if an error occurs
 */
export const getAllUsersSearch = withAccessControl(
  {
    requiredPermissions: {
      user: ["list"],
    },
  },
  cache(async ({ searchTerm }: UserSearchProps) => {
    "use cache";
    cacheTag("user-activity");
    const sanitizedSearchTerm = sanitizeSearchTerm(searchTerm);

    if (!sanitizedSearchTerm) {
      return [];
    }

    const searchValue = `%${searchTerm}%`;
    const result = await hasuraClient.request(
      UserSearch,
      {
        address: searchValue,
      },
      {
        "X-GraphQL-Operation-Name": "UserSearch",
        "X-GraphQL-Operation-Type": "query",
        cache: "force-cache",
      }
    );

    // Parse and validate users using TypeBox schema
    return safeParse(t.Array(UserSchema), result.user || []);
  })
);

/**
 * Searches for users by address, name, or email
 *
 * @param params - Object containing the search string
 * @returns Array of matching users
 * @remarks
 * Returns an empty array if no address is provided or if an error occurs
 */
export const getUserSearch = withTracing(
  "queries",
  "getUserSearch",

  async ({
    searchTerm,
    ctx,
  }: UserSearchProps & { ctx?: { user: User } }): Promise<
    (User | Contact)[]
  > => {
    const user = ctx?.user ?? (await getUser());
    if (user.role === "user") {
      return getContactsList(user.id, searchTerm);
    }
    return getAllUsersSearch({ searchTerm, ctx: { user } });
  }
);

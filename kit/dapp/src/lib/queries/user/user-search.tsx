import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { sanitizeSearchTerm } from '@/lib/utils/string';
import { safeParseWithLogging } from '@/lib/utils/zod';
import { unstable_cache } from 'next/cache';
import { UserFragment, UserFragmentSchema } from './user-fragment';

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
 * Cached function to fetch raw user search data
 */
const fetchUserSearchData = unstable_cache(
  async (searchTerm: string) => {
    if (!searchTerm) {
      return { user: [] };
    }

    const searchValue = `%${searchTerm}%`;
    const result = await hasuraClient.request(UserSearch, {
      address: searchValue,
    });

    return result;
  },
  ['user', 'search'],
  {
    revalidate: 60 * 60,
    tags: ['user'],
  }
);

/**
 * Searches for users by address, name, or email
 *
 * @param params - Object containing the search string
 *
 * @remarks
 * Returns an empty array if no address is provided or if an error occurs
 */
export async function getUserSearch({ searchTerm }: UserSearchProps) {
  const sanitizedSearchTerm = sanitizeSearchTerm(searchTerm);

  if (!sanitizedSearchTerm) {
    return [];
  }

  const result = await fetchUserSearchData(sanitizedSearchTerm);

  // Parse and validate each user in the results using Zod schema
  const validatedUsers = (result.user || []).map((user) =>
    safeParseWithLogging(UserFragmentSchema, user, 'user search')
  );

  return validatedUsers;
}

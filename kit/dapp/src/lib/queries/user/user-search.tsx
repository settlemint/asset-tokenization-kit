import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { sanitizeSearchTerm } from '@/lib/utils/string';
import { useQuery } from '@tanstack/react-query';
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
 * Searches for users by address, name, or email
 *
 * @param params - Object containing the search string
 *
 * @remarks
 * Returns an empty array if no address is provided or if an error occurs
 */
async function getUserSearch({ searchTerm }: UserSearchProps) {
  if (!searchTerm) {
    return [];
  }

  try {
    const searchValue = `%${searchTerm}%`;

    const result = await hasuraClient.request(UserSearch, {
      address: searchValue,
    });

    // Parse and validate each user in the results using Zod schema
    const validatedUsers = (result.user || []).map((user) =>
      UserFragmentSchema.parse(user)
    );

    return validatedUsers;
  } catch (error) {
    console.error('Error searching for users:', error);
    return [];
  }
}

/**
 * Creates a memoized query key for user search queries
 *
 * @param params - Object containing the search string
 */
const getQueryKey = ({ searchTerm }: UserSearchProps) =>
  ['user', 'search', searchTerm ? searchTerm : 'none'] as const;

/**
 * React Query hook for searching users
 *
 * @param params - Object containing the search string
 *
 * @example
 * ```tsx
 * const { data: users, isLoading } = useUserSearch({
 *   address: "0x123" // or any search term
 * });
 *
 * // Later in your component
 * {users.map(user => (
 *   <UserItem key={user.id} user={user} />
 * ))}
 * ```
 */
export function useUserSearch({ searchTerm }: UserSearchProps) {
  const sanitizedSearchTerm = sanitizeSearchTerm(searchTerm);

  const queryKey = getQueryKey({ searchTerm: sanitizedSearchTerm });

  const result = useQuery({
    queryKey,
    queryFn: () => getUserSearch({ searchTerm: sanitizedSearchTerm }),
    enabled: !!sanitizedSearchTerm,
  });

  return {
    ...result,
    queryKey,
  };
}

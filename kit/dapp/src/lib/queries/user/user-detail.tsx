import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { useSuspenseQuery } from '@tanstack/react-query';
import { UserFragment, UserFragmentSchema } from './user-fragment';

/**
 * GraphQL query to fetch user details from Hasura
 *
 * @remarks
 * Retrieves a single user by their primary key (ID)
 */
const UserDetail = hasuraGraphql(
  `
  query UserDetail($id: String!) {
    user_by_pk(id: $id) {
      ...UserFragment
    }
  }
`,
  [UserFragment]
);

/**
 * Props interface for user detail components
 *
 * @property {string} id - The unique identifier of the user to fetch
 */
export interface UserDetailProps {
  /** User ID */
  id: string;
}

/**
 * Fetches and processes user data from the database
 *
 * @param {UserDetailProps} params - Object containing the user ID
 * @returns {Promise<User>} The validated user data
 * @throws {Error} If the user is not found or if fetching/parsing fails
 *
 * @remarks
 * This function validates the response using the UserFragmentSchema
 */
async function getUserDetail({ id }: UserDetailProps) {
  try {
    const result = await hasuraClient.request(UserDetail, {
      id,
    });

    if (!result.user_by_pk) {
      throw new Error(`User ${id} not found`);
    }

    // Parse and validate the user data with Zod schema
    const validatedUser = UserFragmentSchema.parse(result.user_by_pk);

    return validatedUser;
  } catch (error) {
    // Re-throw with more context
    throw error instanceof Error
      ? error
      : new Error(`Failed to fetch user ${id}`);
  }
}

/**
 * Creates a memoized query key for user detail queries
 *
 * @param {UserDetailProps} params - Object containing the user ID
 * @returns {readonly [string, string]} The query key tuple
 */
const getQueryKey = ({ id }: UserDetailProps) => ['user', id] as const;

/**
 * React Query hook for fetching user details
 *
 * @param {UserDetailProps} params - Object containing the user ID
 * @returns {Object} Query result with user data and query key
 *
 * @example
 * ```tsx
 * const { data: user, isLoading } = useUserDetail({ id: "user-123" });
 * ```
 */
export function useUserDetail({ id }: UserDetailProps) {
  const queryKey = getQueryKey({ id });

  const result = useSuspenseQuery({
    queryKey,
    queryFn: () => getUserDetail({ id }),
  });

  return {
    ...result,
    queryKey,
  };
}

/**
 * React Query hook for optionally fetching user details
 *
 * @param {UserDetailProps} params - Object containing the user ID
 * @returns {Object|null} Query result with user data or null if not found
 *
 * @remarks
 * Returns null instead of throwing if the user cannot be found
 *
 * @example
 * ```tsx
 * const userResult = useOptionalUserDetail({ id: "user-123" });
 * if (userResult) {
 *   // User exists, use userResult.data
 * } else {
 *   // User not found
 * }
 * ```
 */
export function useOptionalUserDetail({ id }: UserDetailProps) {
  try {
    return useUserDetail({ id });
  } catch {
    return null;
  }
}

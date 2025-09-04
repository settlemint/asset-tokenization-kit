import { orpc } from "@/orpc/orpc-client";
import type { User } from "@/orpc/routes/user/routes/user.me.schema";
import { useSuspenseQuery } from "@tanstack/react-query";

interface UseUsersWithIdentitiesOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
}

interface UseUsersWithIdentitiesResult {
  users: User[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook for fetching users with their identity information
 * Combines database user data with on-chain identity status
 * 
 * @param options - Query options for pagination and sorting
 * @returns Users array with loading and error states
 */
export function useUsersWithIdentities(
  options: UseUsersWithIdentitiesOptions = {}
): UseUsersWithIdentitiesResult {
  const {
    limit = 1000,
    offset = 0,
    orderBy = "createdAt",
    orderDirection = "desc",
  } = options;

  const query = useSuspenseQuery(
    orpc.user.list.queryOptions({
      input: {
        limit,
        offset,
        orderBy,
        orderDirection,
      },
    })
  );

  return {
    users: query.data?.items ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

/**
 * Hook for fetching a single user by ID
 * Useful for detail pages
 * 
 * @param userId - The user ID to fetch
 * @returns User data with loading and error states
 */
export function useUserById(_userId: string) {
  // This would need to be implemented with a new ORPC endpoint
  // For now, returning a placeholder
  return {
    user: null as User | null,
    isLoading: false,
    error: null as Error | null,
  };
}
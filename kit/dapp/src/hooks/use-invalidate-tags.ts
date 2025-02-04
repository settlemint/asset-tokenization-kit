'use client';

import { type QueryKey, useQueryClient } from '@tanstack/react-query';

/**
 * Utility function to invalidate both Next.js cache tags and React Query tags
 * @param tags Array of tags to invalidate
 * @returns Result indicating success or failure of the invalidation
 */
export function useInvalidateTags() {
  const queryClient = useQueryClient();

  return (tags: QueryKey[]) => {
    for (const tag of tags) {
      queryClient.invalidateQueries({
        queryKey: tag,
        refetchType: 'active',
      });
    }
  };
}

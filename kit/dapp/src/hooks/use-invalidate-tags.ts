'use client';

import type { QueryKey } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Enhanced hook for invalidating query cache entries
 * Provides type-safe invalidation using the centralized query key system
 */
export function useInvalidateTags() {
  const queryClient = useQueryClient();

  return {
    /**
     * Invalidate specific query keys
     * Dependencies will be automatically invalidated
     * @param key Query key to invalidate
     */
    invalidateQueries: (key: QueryKey) => {
      queryClient.invalidateQueries({
        queryKey: key,
        refetchType: 'active',
      });
    },

    /**
     * Invalidate all queries that match a partial key
     * Dependencies will be automatically invalidated
     * @param matcher Partial key to match against
     */
    invalidateMatching: (matcher: string[]) => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          if (matcher.length > key.length) {
            return false;
          }
          return matcher.every((segment, index) => key[index] === segment);
        },
        refetchType: 'active',
      });
    },

    /**
     * Reset entire query cache
     */
    invalidateAll: () => {
      queryClient.invalidateQueries({
        refetchType: 'active',
      });
    },
  };
}

'use client';

import { queryKeys } from '@/lib/query-keys';
import type { QueryKey } from '@tanstack/react-query';

type QueryKeyValue = readonly string[] | QueryKey;

/**
 * Hook to provide type-safe access to query keys
 * This centralizes query key access and ensures consistency across the application
 */
export function useQueryKeys() {
  return {
    keys: queryKeys,

    /**
     * Combine multiple query keys into a single key
     * Useful for components that need to depend on multiple data sources
     * @param keys Array of query keys to combine
     * @returns Combined query key
     */
    combine: (...keys: QueryKeyValue[]): QueryKey => {
      return keys.flat() as QueryKey;
    },

    /**
     * Create a dynamic query key with proper typing
     * @param base Base query key
     * @param dynamic Dynamic segments to append
     * @returns Combined query key
     */
    dynamic: (base: QueryKeyValue, ...dynamic: string[]): QueryKey => {
      return [...base, ...dynamic] as QueryKey;
    },
  };
}

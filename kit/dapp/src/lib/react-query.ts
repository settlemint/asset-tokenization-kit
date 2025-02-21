import { QueryClient, type QueryKey } from '@tanstack/react-query';
import { cache } from 'react';
import { type Address, getAddress } from 'viem';
import type { assetConfig } from './config/assets';

type AssetType = keyof typeof assetConfig;
type Category = 'asset' | 'user' | 'transaction';
type StatType = 'supply' | 'volume' | 'transfers' | 'holders';
type ChartType = 'supply' | 'history' | 'activity' | 'transaction';

export const defaultRefetchInterval = 1000 * 5; // 5 seconds (block time is 2 or 60 if there is no usage)

/**
 * Type-safe query key factory for the application
 */
export const queryKeys = {
  // Asset queries
  asset: {
    any: () => ['asset', 'any'] as const,
    all: (type?: AssetType) => (type ? (['asset', type] as const) : (['asset'] as const)),
    detail: (params: { type?: AssetType; address: Address }) =>
      params.type
        ? (['asset', 'detail', params.type, getAddress(params.address)] as const)
        : (['asset', 'detail', getAddress(params.address)] as const),
    stats: (params: { address: Address; type: StatType }) =>
      ['asset', 'stats', params.type, getAddress(params.address)] as const,
    events: (address?: Address) => ['asset', 'events', address ?? '*'] as const,
    permissions: (params: { type?: AssetType; address: Address }) =>
      params.type
        ? (['asset', 'permissions', params.type, getAddress(params.address)] as const)
        : (['asset', 'permissions', getAddress(params.address)] as const),
  },

  // User queries
  user: {
    all: () => ['user'] as const,
    detail: (id: string) => ['user', id] as const,
    stats: () => ['user', 'stats'] as const,
    profile: (params: { address?: Address; email?: string; imageUrl?: string }) =>
      [
        'user',
        'profile',
        params.address ? getAddress(params.address) : '*',
        params.email ?? '*',
        params.imageUrl ?? '*',
      ] as const,
    balances: (address: Address) => ['user', 'balances', getAddress(address)] as const,
    transactions: (params: { email?: string; wallet?: Address }) =>
      ['user', 'transactions', params.email ?? '*', params.wallet ? getAddress(params.wallet) : '*'] as const,
  },

  // Dashboard queries
  dashboard: {
    widget: (type: Category) => ['dashboard', 'widget', type] as const,
    chart: (type: ChartType) => ['dashboard', 'chart', type] as const,
  },

  // Search queries
  search: (term: string, section?: string) => ['search', term, section ?? '*'] as const,
  pendingTransactions: (from?: Address) => ['pendingTransactions', from ?? '*'] as const,
} as const;

/**
 * Helper type to extract all possible query keys
 */
export type QueryKeys = typeof queryKeys;

/**
 * Predicate function to determine if a query key should be invalidated based on an asset address
 * @param address The asset address to check against
 * @returns A function that tests if a query key should be invalidated
 */
function assetAffectsPredicate(address: string) {
  return (queryKey: QueryKey) => {
    const [category, subcategory] = queryKey;
    return (
      // Invalidate all details for this asset
      (category === 'asset' && queryKey.includes(address)) ||
      // Invalidate all stats for this asset
      (category === 'asset' && subcategory === 'stats' && queryKey.includes(address)) ||
      // Invalidate events for this asset
      (category === 'asset' && subcategory === 'events' && queryKey.includes(address)) ||
      // Invalidate all asset queries when any asset changes
      (category === 'asset' && subcategory === 'any') ||
      // Invalidate dashboard widgets and charts related to assets
      (category === 'dashboard' && (queryKey.includes('asset') || queryKey.includes('transaction')))
    );
  };
}

/**
 * Predicate function to determine if a query key should be invalidated based on a user ID
 * @param id The user ID to check against
 * @returns A function that tests if a query key should be invalidated
 */
function userAffectsPredicate(id: string) {
  return (queryKey: QueryKey) => {
    const [category, subcategory] = queryKey;
    return (
      // Invalidate user's balances
      (category === 'user' && subcategory === 'balances' && queryKey.includes(id)) ||
      // Invalidate user's transactions
      (category === 'user' && subcategory === 'transactions' && queryKey.includes(id)) ||
      // Invalidate dashboard widgets and charts related to users
      (category === 'dashboard' && (queryKey.includes('user') || queryKey.includes('transaction')))
    );
  };
}

/**
 * Automatic dependency rules for query invalidation
 */
const dependencyRules = {
  asset: {
    affects: (key: QueryKey) => {
      const address = key.at(-1)?.toString(); // Ensure we get a string
      if (!address || typeof address !== 'string') {
        return false;
      }
      return assetAffectsPredicate(address);
    },
  },
  user: {
    affects: (key: QueryKey) => {
      const [, id] = key;
      if (!id || typeof id !== 'string') {
        return false;
      }
      return userAffectsPredicate(id);
    },
  },
} as const;

/**
 * Creates a QueryClient with automatic invalidation support
 */
function createQueryClient(): QueryClient {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchInterval: defaultRefetchInterval,
        refetchOnWindowFocus: true,
        refetchIntervalInBackground: false,
        networkMode: 'online',
        staleTime: 1000 * 60, // Consider data stale after 1 minute
        retry: 3, // Retry failed requests 3 times
      },
    },
  });

  const originalInvalidateQueries = queryClient.invalidateQueries.bind(queryClient);

  // Override the invalidateQueries method to handle automatic dependency invalidation
  queryClient.invalidateQueries = async (filters, options) => {
    // Call original invalidation
    await originalInvalidateQueries(filters, options);

    // Handle automatic dependency invalidation
    if (filters?.queryKey) {
      const [category] = filters.queryKey;
      const rule = dependencyRules[category as keyof typeof dependencyRules];

      if (rule) {
        const predicate = rule.affects(filters.queryKey);
        if (predicate) {
          await originalInvalidateQueries({ ...filters, predicate }, options);
        }
      }
    }
  };

  return queryClient;
}

/**
 * Cached QueryClient instance with automatic dependency invalidation
 */
export const getQueryClient = cache(() => createQueryClient());

/**
 * Common invalidation patterns for the application
 */
export const invalidationPatterns = {
  asset: {
    all: (type?: AssetType) => ({ queryKey: queryKeys.asset.all(type) }),
    byAddress: (address: Address, type?: AssetType) =>
      type
        ? { queryKey: queryKeys.asset.detail({ type, address }) }
        : { predicate: (queryKey: QueryKey) => queryKey[0] === 'asset' && queryKey.includes(address) },
    byAddressAndType: (address: Address, type: StatType) => ({
      queryKey: queryKeys.asset.stats({ address, type }),
    }),
  },
  user: {
    all: () => ({ queryKey: queryKeys.user.all() }),
    byId: (id: string) => ({
      predicate: (queryKey: QueryKey) => queryKey[0] === 'user' && queryKey.includes(id),
    }),
  },
  dashboard: {
    all: () => ({ queryKey: ['dashboard'] as const }),
    byCategory: (category: Category) => ({
      predicate: (queryKey: QueryKey) => queryKey[0] === 'dashboard' && queryKey.includes(category),
    }),
  },
} as const;

/**
 * Sanitizes a search term for safe use in database queries
 * @param search The raw search term
 * @returns The sanitized search term
 */
export function sanitizeSearchTerm(search: string): string {
  // Remove any non-alphanumeric characters except spaces and common symbols
  const cleaned = search
    .trim()
    // Allow letters, numbers, spaces, and common symbols
    .replace(/[^a-zA-Z0-9\s@._-]/g, '')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    // Escape special characters used in LIKE patterns
    .replace(/[%_]/g, '\\$&');

  return cleaned;
}

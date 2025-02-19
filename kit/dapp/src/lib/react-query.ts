import { QueryClient, type QueryKey } from '@tanstack/react-query';
import { cache } from 'react';
import type { Address } from 'viem';

/**
 * Type-safe query key factory for the application
 */
export const queryKeys = {
  assets: {
    root: ['assets'] as const,
    all: (type: 'bonds' | 'equities' | 'funds' | 'stablecoins' | 'cryptocurrencies') => ['assets', type] as const,
    detail: (type: string, address: Address) => ['assets', type, address] as const,
    stats: {
      supply: (address: Address) => ['assets', 'stats', 'supply', address] as const,
      volume: (address: Address) => ['assets', 'stats', 'volume', address] as const,
      transfers: (address: Address) => ['assets', 'stats', 'transfers', address] as const,
      holders: (address: Address) => ['assets', 'stats', 'holders', address] as const,
    },
    events: (address?: Address) =>
      address ? (['assets', 'events', address] as const) : (['assets', 'events'] as const),
  },
  users: {
    root: ['users'] as const,
    detail: (id: string) => ['users', id] as const,
    stats: ['users', 'stats'] as const,
    avatar: (address?: Address, imageUrl?: string | null, email?: string) =>
      ['users', 'avatar', address ?? '', imageUrl ?? '', email ?? ''] as const,
    balances: (address: Address) => ['users', 'balances', address] as const,
    search: (term: string) => ['users', 'search', term] as const,
    pendingTransactions: (email?: string, wallet?: Address) =>
      ['users', 'pending-transactions', email ?? '', wallet ?? ''] as const,
  },
  dashboard: {
    widgets: {
      assets: ['dashboard', 'widgets', 'assets'] as const,
      users: ['dashboard', 'widgets', 'users'] as const,
      transactions: ['dashboard', 'widgets', 'transactions'] as const,
    },
    charts: {
      assetsSupply: ['dashboard', 'charts', 'assets-supply'] as const,
      usersHistory: ['dashboard', 'charts', 'users-history'] as const,
      assetsActivity: ['dashboard', 'charts', 'assets-activity'] as const,
      transactionsHistory: ['dashboard', 'charts', 'transactions-history'] as const,
    },
  },
  search: (term: string) => ['search', term] as const,
} as const;

/**
 * Helper type to extract all possible query keys
 */
export type QueryKeys = typeof queryKeys;

/**
 * Helper to create a partial query key for invalidation
 */
function createInvalidationKey(segments: string[]): QueryKey {
  return segments as QueryKey;
}

/**
 * Type representing all possible data categories
 */
type DataCategory = 'assets' | 'users' | 'transactions';

/**
 * Helper to get dependent query keys for dashboard updates
 */
function getDependentDashboardKeys(category: DataCategory): QueryKey[] {
  const keys: QueryKey[] = [];

  // Always include the specific widget
  keys.push(createInvalidationKey(['dashboard', 'widgets', category]));

  // Add chart dependencies based on category
  if (category === 'assets') {
    keys.push(
      createInvalidationKey(['dashboard', 'charts', 'assets-supply']),
      createInvalidationKey(['dashboard', 'charts', 'assets-activity'])
    );
  } else if (category === 'users') {
    keys.push(createInvalidationKey(['dashboard', 'charts', 'users-history']));
  } else if (category === 'transactions') {
    keys.push(createInvalidationKey(['dashboard', 'charts', 'transactions-history']));
  }

  return keys;
}

/**
 * Helper to get dependent query keys for asset-related updates
 */
function getDependentAssetKeys(address: Address): QueryKey[] {
  return [
    createInvalidationKey(['assets', 'stats', 'supply', address]),
    createInvalidationKey(['assets', 'stats', 'volume', address]),
    createInvalidationKey(['assets', 'stats', 'transfers', address]),
    createInvalidationKey(['assets', 'stats', 'holders', address]),
    createInvalidationKey(['assets', 'events', address]),
  ];
}

/**
 * Helper to get dependent query keys for user-related updates
 */
function getDependentUserKeys(address: Address): QueryKey[] {
  return [
    createInvalidationKey(['users', 'balances', address]),
    createInvalidationKey(['users', 'pending-transactions', '', address]),
  ];
}

/**
 * Helper to get all dependent keys that should be invalidated
 */
function getDependentKeys(queryKey: QueryKey): QueryKey[] {
  const [category, subCategory, id] = queryKey;
  const keys: QueryKey[] = [];

  // Add dashboard dependencies
  if (category === 'assets' || category === 'users' || category === 'transactions') {
    keys.push(...getDependentDashboardKeys(category));
  }

  // Add asset-specific dependencies
  if (category === 'assets' && id) {
    keys.push(...getDependentAssetKeys(id as Address));
  }

  // Add user-specific dependencies
  if (category === 'users' && id) {
    keys.push(...getDependentUserKeys(id as Address));
  }

  // Handle special cases for transactions
  if (category === 'transactions') {
    // Transactions might affect both assets and users involved
    // We'll need the specific transaction data to know which ones to invalidate
    // This would be handled by the mutation function directly
  }

  return keys;
}

/**
 * Creates a QueryClient with automatic invalidation support
 */
function createQueryClient(): QueryClient {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: true,
        refetchIntervalInBackground: false,
        networkMode: 'online',
        staleTime: 1000 * 60, // Consider data stale after 1 minute
        retry: 3, // Retry failed requests 3 times
      },
    },
  });

  const originalInvalidateQueries = queryClient.invalidateQueries.bind(queryClient);

  // Override the invalidateQueries method to handle all dependencies
  queryClient.invalidateQueries = async (filters, options) => {
    // Call original invalidation
    await originalInvalidateQueries(filters, options);

    // If we have a query key, check for dependencies
    if (filters?.queryKey) {
      const dependentKeys = getDependentKeys(filters.queryKey);
      for (const key of dependentKeys) {
        await originalInvalidateQueries({ ...filters, queryKey: key }, options);
      }
    }
  };

  return queryClient;
}

/**
 * Cached QueryClient instance with automatic dashboard invalidation
 */
export const getQueryClient = cache(() => createQueryClient());

/**
 * Common invalidation patterns for the application
 */
export const invalidationPatterns = {
  allAssets: createInvalidationKey(['assets']),
  allUsers: createInvalidationKey(['users']),
  allDashboard: createInvalidationKey(['dashboard']),
  assetsByType: (type: string) => createInvalidationKey(['assets', type]),
  assetDetail: (type: string, address: Address) => createInvalidationKey(['assets', type, address]),
  assetStats: (address: Address) => createInvalidationKey(['assets', 'stats', address]),
  assetEvents: (address?: Address) =>
    address ? createInvalidationKey(['assets', 'events', address]) : createInvalidationKey(['assets', 'events']),
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

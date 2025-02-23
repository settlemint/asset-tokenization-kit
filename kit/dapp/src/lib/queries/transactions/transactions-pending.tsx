import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { useSuspenseQuery } from '@tanstack/react-query';
import { type Address, getAddress } from 'viem';
import { TransactionFragment } from './transaction-fragment';

/**
 * GraphQL query to fetch pending transactions from the Portal API
 *
 * @remarks
 * Retrieves pending transactions for a specific address
 */
const PendingTransactions = portalGraphql(
  `
  query PendingTransactions($from: String) {
    getPendingTransactions(from: $from) {
      count
      records {
        ...TransactionFragment
      }
    }
  }
`,
  [TransactionFragment]
);

/**
 * Props interface for pending transactions queries
 *
 * @property {Address} [address] - Optional wallet address to filter transactions
 * @property {number} [pollInterval] - Polling interval in milliseconds for real-time updates
 */
export interface PendingTransactionsProps {
  address?: Address;
  // Short poll interval in milliseconds, useful for updating pending tx count frequently
  pollInterval?: number;
}

/**
 * Fetches the count of pending transactions for a specific address
 *
 * @param {PendingTransactionsProps} props - Props containing the address to query
 * @returns {Promise<number>} The count of pending transactions
 *
 * @remarks
 * Returns 0 if no address is provided or if an error occurs during the query
 */
export async function getPendingTransactions({
  address,
}: PendingTransactionsProps) {
  if (!address) {
    return 0;
  }

  try {
    const response = await portalClient.request(PendingTransactions, {
      from: address,
    });

    return response?.getPendingTransactions?.count || 0;
  } catch (error) {
    console.error(`Error fetching pending transactions for ${address}:`, error);
    return 0;
  }
}

/**
 * Creates a memoized query key for pending transactions queries
 *
 * @param {PendingTransactionsProps} props - Props containing the address to query
 * @returns {readonly [string, string, string]} The query key tuple
 */
const getQueryKey = ({ address }: PendingTransactionsProps) =>
  [
    'asset',
    'pendingTransactions',
    address ? getAddress(address) : 'all',
  ] as const;

/**
 * React Query hook for fetching pending transactions count
 *
 * @param {PendingTransactionsProps} props - Props containing the address and poll interval
 * @returns {Object} Query result with pending transactions count and query key
 *
 * @example
 * ```tsx
 * const { data: pendingCount } = usePendingTransactions({
 *   address: "0x...",
 *   pollInterval: 3000
 * });
 * ```
 */
export function usePendingTransactions({
  address,
  pollInterval = 5000, // Default 5 seconds for pending transactions
}: PendingTransactionsProps) {
  const queryKey = getQueryKey({ address });

  const result = useSuspenseQuery({
    queryKey,
    queryFn: () => getPendingTransactions({ address }),
    refetchInterval: pollInterval, // Poll for updates
    staleTime: 5000, // 5 seconds
    gcTime: 10000, // 10 seconds
  });

  return {
    ...result,
    queryKey,
  };
}

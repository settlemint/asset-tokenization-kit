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
 */
export interface PendingTransactionsProps {
  address?: Address;
  // Short poll interval in milliseconds, useful for updating pending tx count frequently
  refetchInterval?: number;
}

/**
 * Fetches the count of pending transactions for a specific address
 *
 * @param props - Props containing the address to query
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
 * @param props - Props containing the address to query
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
 * @param props - Props containing the address and poll interval
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
  refetchInterval,
}: PendingTransactionsProps) {
  const queryKey = getQueryKey({ address });

  const result = useSuspenseQuery({
    queryKey,
    queryFn: () => getPendingTransactions({ address }),
    refetchInterval, // Poll for updates
    staleTime: 5000, // 5 seconds
    gcTime: 10000, // 10 seconds
  });

  return {
    ...result,
    queryKey,
  };
}

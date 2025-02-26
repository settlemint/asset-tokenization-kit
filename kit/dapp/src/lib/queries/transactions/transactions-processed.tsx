import { TransactionFragment } from '@/lib/queries/transactions/transaction-fragment';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { useSuspenseQuery } from '@tanstack/react-query';
import { type Address, getAddress } from 'viem';

/**
 * GraphQL query to fetch pending transactions from the Portal API
 *
 * @remarks
 * Retrieves pending transactions for a specific address
 */
const ProcessedTransactionsHistory = portalGraphql(
  `
  query ProcessedTransactionsHistory($processedAfter: String, $from: String) {
    getProcessedTransactions(processedAfter: $processedAfter, from: $from) {
      count
      records {
        ...TransactionFragment
      }
    }
    total: getProcessedTransactions {
      count
    }
  }
`,
  [TransactionFragment]
);

/**
 * Props interface for pending transactions queries
 *
 */
export interface ProcessedTransactionsProps {
  address?: Address;
  processedAfter?: Date;
}

/**
 * Fetches the count of pending transactions for a specific address
 *
 * @param props - Props containing the address to query
 *
 * @remarks
 * Returns 0 if no address is provided or if an error occurs during the query
 */
export async function getProcessedTransactions({
  address,
  processedAfter,
}: ProcessedTransactionsProps) {
  try {
    const response = await portalClient.request(ProcessedTransactionsHistory, {
      from: address,
      processedAfter: processedAfter?.toISOString(),
    });

    return {
      total: response.getProcessedTransactions?.count ?? 0,
      recentCount: response.getProcessedTransactions?.count ?? 0,
      records:
        response.getProcessedTransactions?.records
          .filter((record) => record.createdAt)
          .map((record) => ({
            timestamp: new Date(record.createdAt ?? ''),
            transaction: 1,
          })) ?? [],
    };
  } catch (error) {
    console.error(
      `Error fetching processed transactions for ${address}:`,
      error
    );
    return {
      total: 0,
      recentCount: 0,
      records: [],
    };
  }
}

/**
 * Creates a memoized query key for pending transactions queries
 *
 * @param props - Props containing the address to query
 */
const getQueryKey = ({ address, processedAfter }: ProcessedTransactionsProps) =>
  [
    'transaction',
    'processedTransactions',
    address ? getAddress(address) : 'all',
    processedAfter ? processedAfter.toISOString() : 'all',
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
export function useProcessedTransactions({
  address,
  processedAfter,
}: ProcessedTransactionsProps) {
  const queryKey = getQueryKey({ address, processedAfter });

  const result = useSuspenseQuery({
    queryKey,
    queryFn: () => getProcessedTransactions({ address, processedAfter }),
  });

  return {
    ...result,
    queryKey,
  };
}

import { TransactionFragment } from '@/lib/queries/transactions/transaction-fragment';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { cache } from 'react';
import type { Address } from 'viem';

/**
 * GraphQL query to fetch processed transactions from the Portal API
 *
 * @remarks
 * Retrieves processed transactions for a specific address
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
 * Props interface for processed transactions queries
 *
 */
export interface ProcessedTransactionsProps {
  address?: Address;
  processedAfter?: Date;
}

/**
 * Fetches processed transactions for a specific address
 *
 * @param props - Props containing the address to query and optional processedAfter date
 *
 * @remarks
 * Returns transaction data with total count, recent count, and transaction records
 */
export const getProcessedTransactions = cache(
  async (props: ProcessedTransactionsProps) => {
    const { address, processedAfter } = props;
    const response = await portalClient.request(ProcessedTransactionsHistory, {
      from: address,
      processedAfter: processedAfter?.toISOString(),
    });

    return {
      total: response.total?.count ?? 0,
      recentCount: response.getProcessedTransactions?.count ?? 0,
      records:
        response.getProcessedTransactions?.records
          .filter((record) => record.createdAt)
          .map((record) => ({
            timestamp: new Date(record.createdAt ?? ''),
            transaction: 1,
          })) ?? [],
    };
  }
);

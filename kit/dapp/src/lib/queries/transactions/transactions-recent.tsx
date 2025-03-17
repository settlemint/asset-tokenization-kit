import { fetchAllPortalPages } from '@/lib/pagination';
import {
  TransactionFragment,
  TransactionFragmentSchema,
} from '@/lib/queries/transactions/transaction-fragment';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z } from '@/lib/utils/zod';
import { cache } from 'react';
import type { Address } from 'viem';

/**
 * GraphQL query to fetch processed transactions from the Portal API
 *
 * @remarks
 * Retrieves processed transactions for a specific address
 */
const RecentTransactionsHistory = portalGraphql(
  `
  query RecentTransactionsHistory($processedAfter: String, $from: String, $pageSize: Int, $page: Int) {
    getPendingAndRecentlyProcessedTransactions(processedAfter: $processedAfter, from: $from, pageSize: $pageSize, page: $page) {
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
 * Props interface for processed transactions queries
 *
 */
export interface RecentTransactionsProps {
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
export const getRecentTransactions = cache(
  async (props: RecentTransactionsProps) => {
    const { address, processedAfter } = props;
    const transactions = await fetchAllPortalPages(
      async ({ page, pageSize }) => {
        const response = await portalClient.request(RecentTransactionsHistory, {
          from: address,
          processedAfter: processedAfter?.toISOString(),
          pageSize,
          page,
        });
        return {
          count:
            response.getPendingAndRecentlyProcessedTransactions?.count ?? 0,
          records:
            response.getPendingAndRecentlyProcessedTransactions?.records ?? [],
        };
      }
    );

    return z.array(TransactionFragmentSchema).parse(transactions?.records);
  }
);

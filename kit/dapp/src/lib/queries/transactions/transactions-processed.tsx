import { fetchAllPortalPages } from "@/lib/pagination";
import { TransactionFragment } from "@/lib/queries/transactions/transaction-fragment";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { cache } from "react";
import type { Address } from "viem";

/**
 * GraphQL query to fetch processed transactions from the Portal API
 *
 * @remarks
 * Retrieves processed transactions for a specific address
 */
const ProcessedTransactionsHistory = portalGraphql(
  `
  query ProcessedTransactionsHistory($processedAfter: String, $from: String, $pageSize: Int, $page: Int) {
    getProcessedTransactions(processedAfter: $processedAfter, from: $from, pageSize: $pageSize, page: $page) {
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
 * GraphQL query to fetch processed and recent transactions from the Portal API
 *
 * @remarks
 * Retrieves processed and recent transactions for a specific address
 */
const ProcessedAndRecentTransactionsHistory = portalGraphql(
  `
  query ProcessedTransactionsHistory($processedAfter: String, $from: String) {
    recent:getProcessedTransactions(processedAfter: $processedAfter, from: $from) {
      count
    }
    total: getProcessedTransactions {
      count
    }
  }
`
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
    const transactions = await fetchAllPortalPages(
      async ({ page, pageSize }) => {
        const response = await portalClient.request(
          ProcessedTransactionsHistory,
          {
            from: address,
            processedAfter: processedAfter?.toISOString(),
            pageSize,
            page,
          }
        );
        return {
          count: response.getProcessedTransactions?.count ?? 0,
          records: response.getProcessedTransactions?.records ?? [],
        };
      }
    );

    return {
      count: transactions?.count ?? 0,
      records:
        transactions?.records
          .filter((record) => record.createdAt)
          .map((record) => ({
            timestamp: new Date(record.createdAt ?? ""),
            transaction: 1,
          })) ?? [],
    };
  }
);

/**
 * Fetches processed and recent transactions count for a specific address
 *
 * @param props - Props containing the address to query and optional processedAfter date
 *
 * @remarks
 * Returns processed and recent transactions count
 */
export const getProcessedAndRecentTransactionsCount = cache(
  async (props: ProcessedTransactionsProps) => {
    const { address, processedAfter } = props;

    const response = await portalClient.request(
      ProcessedAndRecentTransactionsHistory,
      {
        from: address,
        processedAfter: processedAfter?.toISOString(),
      }
    );

    return {
      total: response?.total?.count ?? 0,
      recentCount: response?.recent?.count ?? 0,
    };
  }
);

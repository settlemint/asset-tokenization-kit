import "server-only";

import { fetchAllPortalPages } from "@/lib/pagination";
import {
  TransactionFragment,
  TransactionFragmentSchema,
} from "@/lib/queries/transactions/transaction-fragment";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse, t } from "@/lib/utils/typebox";
import type { Address } from "viem";

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
 * Checks if a value exists and is not null or undefined
 *
 * @param value - The value to check
 * @returns True if the value exists, false otherwise
 */
const checkExists = (value: any): boolean => {
  return value !== null && value !== undefined;
};

/**
 * Fetches processed transactions for a specific address
 *
 * @param props - Props containing the address to query and optional processedAfter date
 *
 * @remarks
 * Returns transaction data with total count, recent count, and transaction records
 */
export const getRecentTransactions = withTracing(
  "queries",
  "getRecentTransactions",
  async (props: RecentTransactionsProps = {}) => {
    const { address, processedAfter } = props;

    try {
      const transactions = await fetchAllPortalPages(
        async ({ page, pageSize }) => {
          const response = await portalClient.request(
            RecentTransactionsHistory,
            {
              from: address,
              processedAfter: processedAfter?.toJSON(),
              pageSize,
              page,
            }
          );

          // Make sure records exists before parsing
          const records =
            response.getPendingAndRecentlyProcessedTransactions?.records ?? [];
          const parsedRecords = safeParse(
            t.Array(TransactionFragmentSchema),
            records
          );

          return {
            count:
              response.getPendingAndRecentlyProcessedTransactions?.count ?? 0,
            records: parsedRecords ?? [],
          };
        }
      );

      return transactions?.records;
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
      return [];
    }
  }
);

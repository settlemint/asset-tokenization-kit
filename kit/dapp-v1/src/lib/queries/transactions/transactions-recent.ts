import "server-only";

import { TransactionFragment } from "@/lib/queries/transactions/transaction-fragment";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withTracing } from "@/lib/utils/sentry-tracing";
import { safeParse, t } from "@/lib/utils/typebox";
import type { Address } from "viem";
import { TransactionSchema } from "./transaction-schema";

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
export const getRecentTransactions = withTracing(
  "queries",
  "getRecentTransactions",
  async (props: RecentTransactionsProps = {}) => {
    // Return empty array if anything fails
    try {
      // Extract props
      const { address, processedAfter } = props;

      // Safely create date string
      let dateString = undefined;
      if (processedAfter && processedAfter instanceof Date) {
        try {
          dateString = processedAfter.toJSON();
        } catch (e) {
          console.error("Failed to convert date to JSON:", e);
        }
      }

      // Fetch data with minimal operations
      const result = await portalClient.request(RecentTransactionsHistory, {
        from: address,
        processedAfter: dateString,
        pageSize: 10, // Use small page size to avoid processing too much data
        page: 0, // Always start with first page
      });

      // Safely extract records with basic checks
      if (!result) {
        return [];
      }

      // Get records array with null check
      const transactions =
        result.getPendingAndRecentlyProcessedTransactions?.records;

      // Simple array check
      if (!Array.isArray(transactions)) {
        return [];
      }

      return safeParse(t.Array(TransactionSchema), transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
  }
);

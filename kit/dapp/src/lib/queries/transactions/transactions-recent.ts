import "server-only";

import { TransactionFragment } from "@/lib/queries/transactions/transaction-fragment";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { withTracing } from "@/lib/utils/tracing";
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
 * Pre-process transaction objects to ensure they can be safely serialized
 * This prevents issues with date fields that might cause serialization errors
 */
function safelyProcessTransactions(transactions: any[]): any[] {
  // If not an array, return empty array
  if (!Array.isArray(transactions)) return [];

  return transactions
    .map((tx) => {
      // If transaction is null or not an object, skip it
      if (!tx || typeof tx !== "object") return null;

      // Create a new object to avoid modifying the original
      const safeTx = { ...tx };

      // Convert date fields to strings if they're not already
      if (safeTx.updatedAt) {
        // If it's a Date object, convert to ISO string
        if (safeTx.updatedAt instanceof Date) {
          safeTx.updatedAt = safeTx.updatedAt.toISOString();
        }
        // If it's already a string, leave it as is
        // This prevents calling toISOString on a string
      }

      if (safeTx.createdAt) {
        // If it's a Date object, convert to ISO string
        if (safeTx.createdAt instanceof Date) {
          safeTx.createdAt = safeTx.createdAt.toISOString();
        }
        // If it's already a string, leave it as is
      }

      return safeTx;
    })
    .filter(Boolean); // Remove any null entries
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
  async (props: RecentTransactionsProps = {}): Promise<any[]> => {
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
      if (!result) return [];

      // Get records array with null check
      const transactions =
        result.getPendingAndRecentlyProcessedTransactions?.records;

      // Simple array check
      if (!transactions || !Array.isArray(transactions)) return [];

      // Pre-process transactions to handle date fields safely
      return safelyProcessTransactions(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
  }
);

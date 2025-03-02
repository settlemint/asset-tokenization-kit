import {
  TransactionFragment,
  TransactionFragmentSchema,
} from "@/lib/queries/transactions/transaction-fragment";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { z } from "@/lib/utils/zod";
import { cache } from "react";
import type { Address } from "viem";

/**
 * GraphQL query to fetch processed transactions from the Portal API
 *
 * @remarks
 * Retrieves processed transactions for a specific address
 */
const RecentTransactionsHistory = portalGraphql(
  `
  query RecentTransactionsHistory($processedAfter: String, $from: String) {
    getPendingAndRecentlyProcessedTransactions(processedAfter: $processedAfter, from: $from) {
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
    const response = await portalClient.request(RecentTransactionsHistory, {
      from: address,
      processedAfter: processedAfter?.toISOString(),
    });

    return z
      .array(TransactionFragmentSchema)
      .parse(response.getPendingAndRecentlyProcessedTransactions?.records);
  }
);

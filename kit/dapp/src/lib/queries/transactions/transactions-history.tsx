import { TransactionFragmentSchema } from "@/lib/queries/transactions/transaction-fragment";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { z } from "@/lib/utils/zod";
import { cache } from "react";
import type { Address } from "viem";

const ProcessedTransactionsHistory = portalGraphql(`
  query ProcessedTransactionsHistory($processedAfter: String, $from: String) {
    getProcessedTransactions(processedAfter: $processedAfter, from: $from) {
      records {
        createdAt
      }
    }
  }
`);

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
export const getTransactionsHistory = cache(
  async (props: RecentTransactionsProps) => {
    const { address, processedAfter } = props;
    const response = await portalClient.request(ProcessedTransactionsHistory, {
      from: address,
      processedAfter: processedAfter?.toISOString(),
    });

    return z
      .array(TransactionFragmentSchema)
      .parse(response.getProcessedTransactions?.records);
  }
);

import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { cache } from "react";
import type { Address } from "viem";

/**
 * GraphQL query to fetch processed and recent transactions from the Portal API
 *
 * @remarks
 * Retrieves processed and recent transactions for a specific address
 */
const ProcessedAndRecentTransactionsHistory = portalGraphql(
  `
  query ProcessedTransactionsHistory($processedAfter: String, $from: String) {
    recent: getProcessedTransactions(processedAfter: $processedAfter, from: $from) {
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
  from?: Address;
  processedAfter?: Date;
}

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
    const { from, processedAfter } = props;

    const response = await portalClient.request(
      ProcessedAndRecentTransactionsHistory,
      {
        from,
        processedAfter: processedAfter?.toISOString(),
      }
    );

    return {
      total: response?.total?.count ?? 0,
      recentCount: response?.recent?.count ?? 0,
    };
  }
);

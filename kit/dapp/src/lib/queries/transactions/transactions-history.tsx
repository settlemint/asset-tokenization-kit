import { fetchAllPortalPages } from "@/lib/pagination";
import {
  TransactionFragment,
  TransactionFragmentSchema,
} from "@/lib/queries/transactions/transaction-fragment";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { z } from "@/lib/utils/zod";
import { cache } from "react";
import type { Address } from "viem";

const ProcessedTransactionsHistory = portalGraphql(
  `
  query ProcessedTransactionsHistory($page: Int!, $pageSize: Int!, $processedAfter: String, $from: String) {
    getProcessedTransactions(processedAfter: $processedAfter, from: $from, page: $page, pageSize: $pageSize) {
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
export const getTransactionsHistory = cache(
  async (props: RecentTransactionsProps) => {
    const { address, processedAfter } = props;
    const { records } = await fetchAllPortalPages(
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

    return z.array(TransactionFragmentSchema).parse(records);
  }
);

export function getTimelineDataOneMonth() {
  return [
    {
      start: "2025-02-13T00:00:00.000Z",
      end: "2025-02-13T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2025-02-14T00:00:00.000Z",
      end: "2025-02-14T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2025-02-15T00:00:00.000Z",
      end: "2025-02-15T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2025-02-16T00:00:00.000Z",
      end: "2025-02-16T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2025-02-17T00:00:00.000Z",
      end: "2025-02-17T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2025-02-18T00:00:00.000Z",
      end: "2025-02-18T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2025-02-19T00:00:00.000Z",
      end: "2025-02-19T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2025-02-20T00:00:00.000Z",
      end: "2025-02-20T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2025-02-21T00:00:00.000Z",
      end: "2025-02-21T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2025-02-22T00:00:00.000Z",
      end: "2025-02-22T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2025-02-23T00:00:00.000Z",
      end: "2025-02-23T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2025-02-24T00:00:00.000Z",
      end: "2025-02-24T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2025-02-25T00:00:00.000Z",
      end: "2025-02-25T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2025-02-26T00:00:00.000Z",
      end: "2025-02-26T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2025-02-27T00:00:00.000Z",
      end: "2025-02-27T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2025-02-28T00:00:00.000Z",
      end: "2025-02-28T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2025-03-01T00:00:00.000Z",
      end: "2025-03-01T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2025-03-02T00:00:00.000Z",
      end: "2025-03-02T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2025-03-03T00:00:00.000Z",
      end: "2025-03-03T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2025-03-04T00:00:00.000Z",
      end: "2025-03-04T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2025-03-05T00:00:00.000Z",
      end: "2025-03-05T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2025-03-06T00:00:00.000Z",
      end: "2025-03-06T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2025-03-07T00:00:00.000Z",
      end: "2025-03-07T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2025-03-08T00:00:00.000Z",
      end: "2025-03-08T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2025-03-09T00:00:00.000Z",
      end: "2025-03-09T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2025-03-10T00:00:00.000Z",
      end: "2025-03-10T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2025-03-11T00:00:00.000Z",
      end: "2025-03-11T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2025-03-12T00:00:00.000Z",
      end: "2025-03-12T23:59:59.999Z",
      count: 102,
    },
    {
      start: "2025-03-13T00:00:00.000Z",
      end: "2025-03-13T23:59:59.999Z",
      count: 0,
    },
  ].map((item) => ({
    timestamp: new Date(item.start).toISOString(),
    transaction: item.count,
  }));
}

export function getTimelineDataOneYear() {
  return [
    {
      start: "2024-03-01T00:00:00.000Z",
      end: "2024-03-31T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2024-04-01T00:00:00.000Z",
      end: "2024-04-30T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2024-05-01T00:00:00.000Z",
      end: "2024-05-31T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2024-06-01T00:00:00.000Z",
      end: "2024-06-30T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2024-07-01T00:00:00.000Z",
      end: "2024-07-31T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2024-08-01T00:00:00.000Z",
      end: "2024-08-31T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2024-09-01T00:00:00.000Z",
      end: "2024-09-30T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2024-10-01T00:00:00.000Z",
      end: "2024-10-31T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2024-11-01T00:00:00.000Z",
      end: "2024-11-30T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2024-12-01T00:00:00.000Z",
      end: "2024-12-31T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2025-01-01T00:00:00.000Z",
      end: "2025-01-31T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2025-02-01T00:00:00.000Z",
      end: "2025-02-28T23:59:59.999Z",
      count: 0,
    },
    {
      start: "2025-03-01T00:00:00.000Z",
      end: "2025-03-31T23:59:59.999Z",
      count: 102,
    },
  ].map((item) => ({
    timestamp: new Date(item.start).toISOString(),
    transaction: item.count,
  }));
}

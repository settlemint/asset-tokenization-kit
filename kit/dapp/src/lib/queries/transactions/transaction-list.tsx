import { fetchAllPortalPages } from "@/lib/pagination";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import { cache } from "react";
import { TransactionFragment } from "./transaction-fragment";
import { TransactionSchema } from "./transaction-schema";

/**
 * GraphQL query to fetch all transactions from the Portal API
 *
 * @remarks
 * Retrieves processed transactions with pagination
 */
const TransactionList = portalGraphql(
  `
  query TransactionList($pageSize: Int, $page: Int) {
    getProcessedTransactions(pageSize: $pageSize, page: $page) {
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
 * GraphQL query to fetch transactions for a specific address from the Portal API
 *
 * @remarks
 * Retrieves processed transactions for a specific address with pagination
 */
const TransactionListByAddress = portalGraphql(
  `
  query TransactionListByAddress($from: String, $pageSize: Int, $page: Int) {
    getProcessedTransactions(from: $from, pageSize: $pageSize, page: $page) {
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
 * Fetches a list of all transactions
 *
 * @remarks
 * This function fetches all processed transactions from the Portal API with pagination.
 */
export const getTransactionList = cache(async () => {
  const transactions = await fetchAllPortalPages(async ({ page, pageSize }) => {
    const response = await portalClient.request(TransactionList, {
      pageSize,
      page,
    });

    return {
      count: response.getProcessedTransactions?.count ?? 0,
      records: response.getProcessedTransactions?.records ?? [],
    };
  });

  return safeParse(t.Array(TransactionSchema), transactions?.records);
});

/**
 * Fetches a list of transactions for a specific address
 *
 * @param from - The address to fetch transactions for
 *
 * @remarks
 * This function fetches processed transactions for a specific address from the Portal API with pagination.
 */
export const getTransactionListByAddress = cache(async (from: string) => {
  const transactions = await fetchAllPortalPages(async ({ page, pageSize }) => {
    const response = await portalClient.request(TransactionListByAddress, {
      from,
      pageSize,
      page,
    });

    return {
      count: response.getProcessedTransactions?.count ?? 0,
      records: response.getProcessedTransactions?.records ?? [],
    };
  });

  return safeParse(t.Array(TransactionSchema), transactions?.records);
});

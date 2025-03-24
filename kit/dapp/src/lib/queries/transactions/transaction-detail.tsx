import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse } from "@/lib/utils/typebox";
import { cache } from "react";
import { TransactionFragment } from "./transaction-fragment";
import { TransactionSchema } from "./transaction-schema";

/**
 * Interface for transaction detail input
 */
export interface TransactionDetailInput {
  transactionHash: string;
}

/**
 * GraphQL query to fetch a single transaction by hash
 */
const TransactionDetail = portalGraphql(
  `
  query TransactionDetail($transactionHash: String!) {
    getTransaction(transactionHash: $transactionHash) {
      ...TransactionFragment
    }
  }
`,
  [TransactionFragment]
);

/**
 * Fetches details for a specific transaction by hash
 *
 * @param input - Input containing transaction hash
 * @returns Transaction details
 *
 * @remarks
 * This function fetches detailed information about a specific transaction
 * identified by its hash from the Portal API.
 */
export const getTransactionDetail = cache(
  async (input: TransactionDetailInput) => {
    const { transactionHash } = input;

    if (!transactionHash) {
      throw new Error("Transaction hash is required");
    }

    const response = await portalClient.request(TransactionDetail, {
      transactionHash,
    });

    // Return null if transaction not found, otherwise parsed transaction
    return response.getTransaction
      ? safeParse(TransactionSchema, response.getTransaction)
      : null;
  }
);

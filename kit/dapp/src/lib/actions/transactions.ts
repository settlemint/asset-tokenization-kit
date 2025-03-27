"use server";

import { getRecentTransactions } from "@/lib/queries/transactions/transactions-recent";
import type { Address } from "viem";

export async function fetchPendingTransactions(address: Address) {
  try {
    const transactions = await getRecentTransactions({
      address,
    });

    // Filter for pending transactions - a transaction is pending if it has no receipt
    return transactions?.filter((tx) => !tx.receipt) ?? [];
  } catch (error) {
    console.error("Error fetching pending transactions:", error);
    return [];
  }
}

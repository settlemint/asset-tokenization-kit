"use server";

import { getRecentTransactions } from "@/lib/queries/transactions/transactions-recent";
import type { Address } from "viem";

export async function fetchPendingTransactions(address: Address) {
  try {
    const transactions = await getRecentTransactions({
      address,
    });

    // Filter for pending transactions
    return (
      transactions?.filter(
        (tx) => tx.receipt?.status.toLowerCase() === "pending"
      ) ?? []
    );
  } catch (error) {
    console.error("Error fetching pending transactions:", error);
    return [];
  }
}

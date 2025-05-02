"use client";

import { apiClient } from "@/lib/api/client";
import { authClient } from "@/lib/auth/client";
import useSWR from "swr";

// Define Transaction type
interface Transaction {
  transactionHash: string;
  from: string;
  receipt?: unknown;
  [key: string]: any;
}

export function usePendingTransactions() {
  const { data: session } = authClient.useSession();
  const wallet = session?.user?.wallet;

  const { data, isLoading, error } = useSWR(
    wallet ? ["pending-transactions", wallet] : null,
    async () => {
      try {
        if (!wallet) return [];

        // Direct fetch from the API endpoint
        const response = await apiClient.api.transaction.recent.get({
          query: {
            address: wallet,
          },
        });

        // Handle the case where the API returns null or undefined
        if (!response || !response.data) {
          return [];
        }

        // Ensure we have an array
        const transactions = Array.isArray(response.data) ? response.data : [];

        // Filter out transactions that have a receipt (they're already processed)
        return transactions.filter((tx: Transaction) => !tx.receipt);
      } catch (error) {
        console.error("Error fetching pending transactions:", error);
        return [];
      }
    },
    {
      refreshInterval: 5000,
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      fallbackData: [],
    }
  );

  // Always ensure we return a valid array
  const pendingTransactions = Array.isArray(data) ? data : [];

  return {
    pendingTransactions,
    isLoading,
    hasPendingTransactions: pendingTransactions.length > 0,
    hasError: Boolean(error),
  };
}

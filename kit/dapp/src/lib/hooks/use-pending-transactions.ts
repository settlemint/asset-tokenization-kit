"use client";

import { apiClient } from "@/lib/api/client";
import { authClient } from "@/lib/auth/client";
import useSWR from "swr";

export function usePendingTransactions() {
  const { data: session } = authClient.useSession();
  const wallet = session?.user?.wallet;

  const { data, isLoading, error } = useSWR(
    wallet ? ["pending-transactions", wallet] : null,
    async () => {
      try {
        if (!wallet) return [];

        const response = await apiClient.api.transaction.recent.get({
          query: {
            address: wallet,
          },
        });

        // Check if we have valid data
        if (response.data && Array.isArray(response.data)) {
          return response.data.filter((tx) => !tx.receipt) || [];
        }

        // Return empty array if data is invalid
        return [];
      } catch (error) {
        console.error("Error fetching pending transactions:", error);
        // Don't let the error propagate up - just return an empty array
        return [];
      }
    },
    {
      refreshInterval: 5000, // Poll every 5 seconds
      revalidateOnFocus: false,
      dedupingInterval: 5000, // Prevent duplicate requests within 5 seconds
      // On error, return empty array
      fallbackData: [],
    }
  );

  const pendingTransactions = data ?? [];

  return {
    pendingTransactions,
    isLoading,
    hasPendingTransactions: pendingTransactions.length > 0,
    hasError: !!error,
  };
}

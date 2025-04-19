"use client";

import { apiClient } from "@/lib/api/client";
import { authClient } from "@/lib/auth/client";
import useSWR from "swr";

export function usePendingTransactions() {
  const { data: session } = authClient.useSession();
  const wallet = session?.user?.wallet;

  const { data, isLoading } = useSWR(
    wallet ? ["pending-transactions", wallet] : null,
    async () => {
      if (!wallet) return [];
      const { data } = await apiClient.api.transaction.recent.get({
        query: {
          address: wallet,
        },
      });
      if (data) {
        return data?.filter((tx: { receipt?: unknown }) => !tx.receipt) ?? [];
      }
      return [];
    },
    {
      refreshInterval: 5000, // Poll every 5 seconds
      revalidateOnFocus: false,
      dedupingInterval: 5000, // Prevent duplicate requests within 5 seconds
    }
  );

  const pendingTransactions = data ?? [];

  return {
    pendingTransactions,
    isLoading,
    hasPendingTransactions: pendingTransactions.length > 0,
  };
}

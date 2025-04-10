"use client";

import { fetchPendingTransactions } from "@/lib/actions/transactions";
import { authClient } from "@/lib/auth/client";
import useSWR from "swr";
import type { Address } from "viem";

export function usePendingTransactions() {
  const { data: session } = authClient.useSession();
  const wallet = session?.user?.wallet as Address | undefined;

  const { data, isLoading } = useSWR(
    wallet ? ["pending-transactions", wallet] : null,
    async () => {
      if (!wallet) return [];
      return fetchPendingTransactions(wallet);
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

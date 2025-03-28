"use client";

import { fetchPendingTransactions } from "@/lib/actions/transactions";
import { authClient } from "@/lib/auth/client";
import type { Transaction } from "@/lib/queries/transactions/transaction-fragment";
import { useEffect, useState } from "react";
import type { Address } from "viem";

export function usePendingTransactions() {
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  const { data: session } = authClient.useSession();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!session?.user?.wallet) return;

      try {
        const pending = await fetchPendingTransactions(
          session.user.wallet as Address
        );
        setPendingTransactions(pending);
      } catch (error) {
        console.error("Error fetching pending transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    void fetchTransactions();

    // Set up polling interval (every 5 seconds)
    const intervalId = setInterval(fetchTransactions, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [session?.user?.wallet]);

  return {
    pendingTransactions,
    isLoading,
    hasPendingTransactions: pendingTransactions.length > 0,
  };
}

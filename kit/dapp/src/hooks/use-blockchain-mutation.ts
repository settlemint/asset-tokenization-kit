import {
  getEthereumHash,
  isEthereumHash,
  type EthereumHash,
} from "@/lib/zod/validators/ethereum-hash";
import { orpc } from "@/orpc";
import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface UseBlockchainMutationOptions<TData, TError, TVariables, TContext> {
  mutationOptions: UseMutationOptions<TData, TError, TVariables, TContext>;
  messages?: {
    pending?: {
      mining?: string;
      indexing?: string;
    };
    success?: string;
    error?: string;
    timeout?: string;
  };
}

interface TrackingState {
  hash: EthereumHash;
  toastId: string | number;
  startTime: number;
}

export function useBlockchainMutation<
  TData = string,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(options: UseBlockchainMutationOptions<TData, TError, TVariables, TContext>) {
  // Use a Map to track multiple transactions
  const [trackingStates, setTrackingStates] = useState<
    Map<EthereumHash, TrackingState>
  >(new Map());
  const queryClient = useQueryClient();

  const messages = {
    pending: {
      mining: options.messages?.pending?.mining ?? "Mining transaction...",
      indexing:
        options.messages?.pending?.indexing ?? "Indexing transaction...",
    },
    success: options.messages?.success ?? "Transaction completed successfully!",
    error: options.messages?.error ?? "Transaction failed",
  };

  // Add a new transaction to track
  const addTracking = useCallback(
    (hash: EthereumHash, toastId: string | number) => {
      setTrackingStates((prev) => {
        const newMap = new Map(prev);
        newMap.set(hash, {
          hash,
          toastId,
          startTime: Date.now(),
        });
        return newMap;
      });
    },
    []
  );

  // Remove a transaction from tracking
  const removeTracking = useCallback(
    (hash: EthereumHash) => {
      setTrackingStates((prev) => {
        const newMap = new Map(prev);
        newMap.delete(hash);
        return newMap;
      });

      // Clean up the query cache for this transaction
      void queryClient.cancelQueries({
        queryKey: orpc.transaction.track.experimental_streamedKey({
          input: {
            transactionHash: hash,
          },
        }),
      });
      void queryClient.resetQueries({
        queryKey: orpc.transaction.track.experimental_streamedKey({
          input: {
            transactionHash: hash,
          },
        }),
      });
    },
    [queryClient]
  );

  // Convert states to array for stable reference
  const statesArray = Array.from(trackingStates.values());

  // Track all active transactions using useQueries
  const trackingQueries = useQueries({
    queries: statesArray.map((state) =>
      orpc.transaction.track.experimental_streamedOptions({
        input: {
          transactionHash: state.hash,
        },
        enabled: isEthereumHash(state.hash),
        staleTime: Infinity,
      })
    ),
  });

  // Extract queries data for dependency tracking
  const queriesData = trackingQueries.map((query) => query.data);

  // Process tracking updates for all transactions
  useEffect(() => {
    queriesData.forEach((data, index) => {
      const state = statesArray[index];
      if (!state || !data) return;

      const trackingData = data as {
        transactionHash: string;
        status: "pending" | "confirmed" | "failed";
        reason?: string;
      }[];

      const trackingStatus = trackingData[trackingData.length - 1];
      if (!trackingStatus) return;

      const { toastId, startTime } = state;
      const isTimeout = Date.now() - startTime > 180000; // 3 minutes

      if (trackingStatus.status === "pending" && !isTimeout) {
        // Update loading message based on progress
        const isIndexing = trackingData.length > 1;
        toast.loading(
          isIndexing ? messages.pending.indexing : messages.pending.mining,
          { id: toastId }
        );
      } else if (trackingStatus.status === "confirmed") {
        toast.success(messages.success, { id: toastId });
        removeTracking(state.hash);
      } else if (trackingStatus.status === "failed") {
        toast.error(`${messages.error}: ${trackingStatus.reason}`, {
          id: toastId,
        });
        removeTracking(state.hash);
      } else if (isTimeout) {
        toast.error(`${messages.error}: Transaction tracking timeout`, {
          id: toastId,
        });
        removeTracking(state.hash);
      }
    });
  }, [queriesData, statesArray, messages, removeTracking]);

  const mutation = useMutation<TData, TError, TVariables, TContext>({
    ...options.mutationOptions,

    onSuccess: (data, variables, context) => {
      const hash = getEthereumHash(data);

      // Create initial toast and store tracking state
      const toastId = toast.loading(messages.pending.mining);
      addTracking(hash, toastId);

      // Call the original onSuccess
      options.mutationOptions.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(messages.error);
      options.mutationOptions.onError?.(error, variables, context);
    },
  });

  // Get all current tracking statuses
  const trackingStatuses = trackingQueries
    .map((query, index) => {
      const state = statesArray[index];
      if (!state || !query.data) return null;

      const trackingData = query.data as {
        transactionHash: string;
        status: "pending" | "confirmed" | "failed";
        reason?: string;
      }[];
      return trackingData[trackingData.length - 1] ?? null;
    })
    .filter(Boolean);

  return {
    ...mutation,
    isTracking: trackingStates.size > 0,
    trackingCount: trackingStates.size,
    trackingHashes: Array.from(trackingStates.keys()),
    trackingStatuses,
  };
}

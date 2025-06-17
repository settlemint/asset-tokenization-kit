/**
 * Blockchain Mutation Hook
 *
 * This module provides a React hook that enhances TanStack Query mutations with
 * blockchain-specific transaction tracking capabilities. It automatically monitors
 * transaction status through mining and indexing phases, providing real-time
 * feedback via toast notifications.
 *
 * Key features:
 * - Automatic transaction tracking via Server-Sent Events
 * - Multi-transaction support with parallel tracking
 * - Customizable status messages for internationalization
 * - Automatic cleanup of completed/failed transactions
 * - Integration with Sonner for toast notifications
 *
 * @see {@link @/orpc/routes/transaction/routes/transaction.track} - Transaction tracking endpoint
 * @see {@link https://tanstack.com/query/latest} - TanStack Query documentation
 */

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

/**
 * Configuration options for blockchain mutations.
 *
 * Extends standard TanStack Query mutation options with blockchain-specific
 * features like customizable status messages for different transaction phases.
 *
 * @template TData - The type of data returned by a successful mutation
 * @template TError - The type of error returned by a failed mutation
 * @template TVariables - The type of variables passed to the mutation
 * @template TContext - The type of context passed to mutation callbacks
 */
interface UseBlockchainMutationOptions<TData, TError, TVariables, TContext> {
  /** Standard TanStack Query mutation options */
  mutationOptions: UseMutationOptions<TData, TError, TVariables, TContext>;
  /** Customizable messages for different transaction states */
  messages?: {
    /** Messages shown while transaction is pending */
    pending?: {
      /** Message shown while transaction is being mined */
      mining?: string;
      /** Message shown while transaction is being indexed */
      indexing?: string;
    };
    /** Message shown when transaction completes successfully */
    success?: string;
    /** Message shown when transaction fails */
    error?: string;
    /** Message shown when transaction tracking times out */
    timeout?: string;
  };
}

/**
 * Internal state for tracking a single transaction.
 *
 * Maintains the necessary information to track and display
 * the status of an individual blockchain transaction.
 */
interface TrackingState {
  /** The transaction hash being tracked */
  hash: EthereumHash;
  /** The toast notification ID for updating messages */
  toastId: string | number;
  /** Timestamp when tracking started (for timeout detection) */
  startTime: number;
}

/**
 * React hook for blockchain mutations with automatic transaction tracking.
 *
 * Wraps a standard TanStack Query mutation to add blockchain-specific features:
 * - Automatic transaction hash extraction from mutation results
 * - Real-time transaction status tracking via SSE
 * - Toast notifications for transaction progress
 * - Multi-transaction support with parallel tracking
 * - Automatic cleanup and timeout handling
 *
 * @template TData - The type of data returned by the mutation (must include transaction hash)
 * @template TError - The type of error that can be thrown
 * @template TVariables - The type of variables passed to the mutation
 * @template TContext - The type of context for mutation callbacks
 *
 * @param options - Configuration options for the blockchain mutation
 * @returns Enhanced mutation object with tracking capabilities
 *
 * @example
 * ```typescript
 * const { mutate, isTracking } = useBlockchainMutation({
 *   mutationOptions: orpc.asset.issue.mutationOptions(),
 *   messages: {
 *     pending: {
 *       mining: "Issuing tokens...",
 *       indexing: "Updating balances..."
 *     },
 *     success: "Tokens issued successfully!",
 *     error: "Failed to issue tokens"
 *   }
 * });
 *
 * // Execute mutation
 * mutate({ assetId: "123", amount: "1000" });
 * ```
 */
export function useBlockchainMutation<
  TData = string,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(options: UseBlockchainMutationOptions<TData, TError, TVariables, TContext>) {
  // Use a Map to track multiple transactions concurrently
  const [trackingStates, setTrackingStates] = useState<
    Map<EthereumHash, TrackingState>
  >(new Map());
  const queryClient = useQueryClient();

  // Merge custom messages with defaults
  const messages = {
    pending: {
      mining: options.messages?.pending?.mining ?? "Mining transaction...",
      indexing:
        options.messages?.pending?.indexing ?? "Indexing transaction...",
    },
    success: options.messages?.success ?? "Transaction completed successfully!",
    error: options.messages?.error ?? "Transaction failed",
  };

  /**
   * Adds a new transaction to the tracking state.
   * Creates a new entry in the tracking map with the provided hash and toast ID.
   */
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

  /**
   * Removes a transaction from tracking and cleans up associated resources.
   * Cancels any pending queries and removes the transaction from the tracking map.
   */
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

  // Convert Map to array for stable reference in useQueries
  const statesArray = Array.from(trackingStates.values());

  /**
   * Track all active transactions in parallel using useQueries.
   * Each transaction gets its own SSE connection for real-time updates.
   */
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

  // Extract queries data for effect dependency tracking
  const queriesData = trackingQueries.map((query) => query.data);

  /**
   * Process tracking updates for all active transactions.
   * Updates toast messages based on transaction status and handles
   * completion, failure, and timeout scenarios.
   */
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

  /**
   * Extract current status for all tracked transactions.
   * Maps query results to their latest status updates.
   */
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
    /** Whether any transactions are currently being tracked */
    isTracking: trackingStates.size > 0,
    /** Number of transactions currently being tracked */
    trackingCount: trackingStates.size,
    /** Array of transaction hashes being tracked */
    trackingHashes: Array.from(trackingStates.keys()),
    /** Current status of all tracked transactions */
    trackingStatuses,
  };
}

import {
  getEthereumHash,
  isEthereumHash,
  type EthereumHash,
} from "@/lib/zod/validators/ethereum-hash";
import { orpc } from "@/orpc";
import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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
  const [trackingState, setTrackingState] = useState<TrackingState | null>(
    null
  );
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

  // Track the transaction using SSE
  const { data: trackingData } = useQuery(
    orpc.transaction.track.experimental_streamedOptions({
      input: {
        transactionHash: trackingState?.hash ?? "",
      },
      enabled: !!trackingState && isEthereumHash(trackingState.hash),
    })
  );

  // Get the latest tracking status
  const trackingStatus = trackingData?.[trackingData.length - 1] ?? null;

  // Handle tracking status updates and toast updates
  useEffect(() => {
    if (!trackingState || !trackingStatus) return;

    const { toastId, startTime } = trackingState;
    const isTimeout = Date.now() - startTime > 180000; // 3 minutes
    console.log("trackingStatus", trackingStatus);
    if (trackingStatus.status === "pending") {
      // Update loading message based on progress
      const isIndexing = trackingData && trackingData.length > 1;
      toast.loading(
        isIndexing ? messages.pending.indexing : messages.pending.mining,
        { id: toastId }
      );
    } else if (trackingStatus.status === "confirmed") {
      toast.success(messages.success, { id: toastId });
      // Stop the tracking query and clear its cache
      void queryClient.cancelQueries({
        queryKey: orpc.transaction.track.experimental_streamedKey({
          input: {
            transactionHash: trackingState.hash,
          },
        }),
      });
      void queryClient.resetQueries({
        queryKey: orpc.transaction.track.experimental_streamedKey({
          input: {
            transactionHash: trackingState.hash,
          },
        }),
      });
      setTrackingState(null);
    } else {
      // trackingStatus.status === "failed"
      toast.error(`${messages.error}: ${trackingStatus.reason}`, {
        id: toastId,
      });
      // Stop the tracking query and clear its cache
      void queryClient.cancelQueries({
        queryKey: orpc.transaction.track.experimental_streamedKey({
          input: {
            transactionHash: trackingState.hash,
          },
        }),
      });
      void queryClient.resetQueries({
        queryKey: orpc.transaction.track.experimental_streamedKey({
          input: {
            transactionHash: trackingState.hash,
          },
        }),
      });
      setTrackingState(null);
    }

    // Handle timeout
    if (isTimeout && trackingStatus.status === "pending") {
      toast.error(`${messages.error}: Transaction tracking timeout`, {
        id: toastId,
      });
      // Stop the tracking query and clear its cache
      void queryClient.cancelQueries({
        queryKey: orpc.transaction.track.experimental_streamedKey({
          input: {
            transactionHash: trackingState.hash,
          },
        }),
      });
      void queryClient.resetQueries({
        queryKey: orpc.transaction.track.experimental_streamedKey({
          input: {
            transactionHash: trackingState.hash,
          },
        }),
      });
      setTrackingState(null);
    }
  }, [trackingStatus, trackingData, trackingState, messages, queryClient]);

  const mutation = useMutation<TData, TError, TVariables, TContext>({
    ...options.mutationOptions,

    onSuccess: (data, variables, context) => {
      const hash = getEthereumHash(data);

      // Create initial toast and store tracking state
      const toastId = toast.loading(messages.pending.mining);
      setTrackingState({
        hash,
        toastId,
        startTime: Date.now(),
      });

      // Call the original onSuccess
      options.mutationOptions.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(messages.error);
      options.mutationOptions.onError?.(error, variables, context);
    },
  });

  return {
    ...mutation,
    isTracking: !!trackingState && trackingStatus?.status === "pending",
    trackingStatus,
  };
}

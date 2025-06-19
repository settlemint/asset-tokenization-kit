/**
 * Streaming Mutation Hook
 *
 * This module provides a React hook that handles ORPC mutations that return
 * streaming responses (AsyncIterator). It processes each yielded event and
 * provides real-time feedback via toast notifications.
 *
 * Key features:
 * - Processes streaming responses from ORPC mutations
 * - Shows toast notifications for each event
 * - Tracks the latest message and final result
 * - Provides a mutate function similar to useMutation
 * - Automatic cleanup and error handling
 * - Automatically adds streaming context to mutation options
 *
 * @see {@link https://tanstack.com/query/latest} - TanStack Query documentation
 */

import type { UseMutationOptions } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

/**
 * Event structure yielded by streaming mutations
 */
interface StreamingEvent<TResult = unknown> {
  status: "pending" | "confirmed" | "failed";
  message: string;
  result?: TResult;
}

/**
 * Configurable messages for the streaming mutation hook
 */
interface StreamingMutationMessages {
  /** Message shown when starting the operation */
  initialLoading?: string;
  /** Message shown when no result is received from the stream */
  noResultError?: string;
  /** Default error message when an error occurs without a specific message */
  defaultError?: string;
  /** Optional message translations map for server-side messages */
  messageMap?: Record<string, string>;
}

/**
 * ORPC mutation object interface
 */
interface ORPCMutation<TResult, TError, TVariables> {
  mutationOptions: (options?: {
    context?: Record<string, unknown>;
  }) => UseMutationOptions<
    AsyncIteratorObject<StreamingEvent<TResult>, unknown, void>,
    TError,
    TVariables
  >;
}

/**
 * Configuration options for streaming mutations.
 *
 * @template TResult - The type of the final result
 * @template TError - The type of error returned by a failed mutation
 * @template TVariables - The type of variables passed to the mutation
 */
interface UseStreamingMutationOptions<TResult, TError, TVariables> {
  /** ORPC mutation object - streaming context will be automatically added */
  mutation: ORPCMutation<TResult, TError, TVariables>;
  /** Configurable messages for different states */
  messages?: StreamingMutationMessages;
}

/**
 * Result object returned by the streaming mutation hook
 */
interface UseStreamingMutationResult<TResult, TError, TVariables> {
  /** Function to execute the mutation */
  mutate: (
    variables: TVariables,
    options?: {
      onSuccess?: (data: TResult) => void;
      onError?: (error: TError) => void;
    }
  ) => void;
  /** Async function to execute the mutation */
  mutateAsync: (
    variables: TVariables,
    options?: {
      onSuccess?: (data: TResult) => void;
      onError?: (error: TError) => void;
    }
  ) => Promise<TResult>;
  /** Whether the mutation is currently executing */
  isPending: boolean;
  /** Whether the mutation is tracking/processing events */
  isTracking: boolean;
  /** The latest message from the stream */
  latestMessage?: string;
  /** The final result from the stream */
  result?: TResult;
  /** Any error that occurred */
  error: TError | null;
  /** Reset the mutation state */
  reset: () => void;
}

/**
 * React hook for streaming mutations with automatic event processing.
 *
 * This hook wraps a standard TanStack Query mutation that returns an AsyncIterator,
 * processing each yielded event and showing toast notifications for progress updates.
 * It automatically adds the streaming context to the mutation options.
 *
 * @template TResult - The type of the final result from the stream
 * @template TError - The type of error that can be thrown
 * @template TVariables - The type of variables passed to the mutation
 *
 * @param options - Configuration options for the streaming mutation
 * @returns Enhanced mutation object with streaming capabilities
 *
 * @example
 * ```typescript
 * const { mutate, result, isTracking } = useStreamingMutation({
 *   mutation: orpc.system.create,
 *   messages: {
 *     initialLoading: t("system.creating"),
 *     noResultError: t("system.noResult"),
 *     defaultError: t("system.error")
 *   }
 * });
 *
 * // Execute mutation
 * mutate({}, {
 *   onSuccess: (systemAddress) => {
 *     console.log("System created:", systemAddress);
 *   }
 * });
 * ```
 */
export function useStreamingMutation<
  TResult = unknown,
  TError = Error,
  TVariables = void,
>(
  options: UseStreamingMutationOptions<TResult, TError, TVariables>
): UseStreamingMutationResult<TResult, TError, TVariables> {
  const [isTracking, setIsTracking] = useState(false);
  const [latestMessage, setLatestMessage] = useState<string>();
  const [result, setResult] = useState<TResult>();
  const toastIdRef = useRef<string | number | undefined>(undefined);
  const onSuccessCallbackRef = useRef<((data: TResult) => void) | undefined>(
    undefined
  );

  // Default messages with English fallbacks
  const messages = {
    initialLoading: options.messages?.initialLoading ?? "Starting operation...",
    noResultError:
      options.messages?.noResultError ?? "No result received from operation",
    defaultError: options.messages?.defaultError ?? "Operation failed",
  };

  // Process the async iterator and handle toasts
  const processStream = useCallback(
    async (
      asyncIterator: AsyncIteratorObject<StreamingEvent<TResult>, unknown, void>
    ) => {
      setIsTracking(true);
      let finalResult: TResult | undefined;

      try {
        // Create initial toast
        toastIdRef.current = toast.loading(messages.initialLoading);

        // Process each event from the stream
        for await (const event of asyncIterator) {
          // Translate the message if a translation map is provided
          const displayMessage =
            options.messages?.messageMap?.[event.message] ?? event.message;
          setLatestMessage(displayMessage);

          if (event.status === "pending") {
            // Update the existing toast with the new message
            toast.loading(displayMessage, { id: toastIdRef.current });
          } else if (event.status === "confirmed") {
            // Success - show success toast and store result
            toast.success(displayMessage, { id: toastIdRef.current });
            if (event.result !== undefined) {
              setResult(event.result);
              finalResult = event.result;
            }
          } else {
            // Failed status - show error toast
            toast.error(displayMessage, { id: toastIdRef.current });
            throw new Error(displayMessage);
          }
        }

        // Call the onSuccess callback if provided
        if (finalResult !== undefined && onSuccessCallbackRef.current) {
          onSuccessCallbackRef.current(finalResult);
        }
      } catch (error) {
        // Handle any errors during stream processing
        const errorMsg =
          error instanceof Error ? error.message : messages.defaultError;
        toast.error(errorMsg, { id: toastIdRef.current });
        throw error;
      } finally {
        setIsTracking(false);
      }

      return finalResult;
    },
    [messages]
  );

  // Get mutation options with streaming context automatically applied
  const mutationOptionsWithContext = options.mutation.mutationOptions();

  const mutation = useMutation<
    AsyncIteratorObject<StreamingEvent<TResult>, unknown, void>,
    TError,
    TVariables
  >({
    ...mutationOptionsWithContext,
    onSuccess: async (asyncIterator, variables, context) => {
      await processStream(asyncIterator);
      // Call the original onSuccess if provided
      mutationOptionsWithContext.onSuccess?.(asyncIterator, variables, context);
    },
    onError: (error, variables, context) => {
      const errorMsg = error instanceof Error ? error.message : String(error);
      toast.error(errorMsg, { id: toastIdRef.current });
      mutationOptionsWithContext.onError?.(error, variables, context);
    },
  });

  const {
    mutate: baseMutate,
    mutateAsync: baseMutateAsync,
    reset: baseReset,
  } = mutation;

  const mutate = useCallback(
    (
      variables: TVariables,
      mutationOptions?: {
        onSuccess?: (data: TResult) => void;
        onError?: (error: TError) => void;
      }
    ) => {
      // Store the onSuccess callback for use in processStream
      onSuccessCallbackRef.current = mutationOptions?.onSuccess;

      baseMutate(variables, {
        onError: mutationOptions?.onError,
      });
    },
    [baseMutate]
  );

  const mutateAsync = useCallback(
    async (
      variables: TVariables,
      mutationOptions?: {
        onSuccess?: (data: TResult) => void;
        onError?: (error: TError) => void;
      }
    ): Promise<TResult> => {
      const asyncIterator = await baseMutateAsync(variables);
      const finalResult = await processStream(asyncIterator);

      if (finalResult !== undefined) {
        mutationOptions?.onSuccess?.(finalResult);
        return finalResult;
      }

      throw new Error(messages.noResultError);
    },
    [baseMutateAsync, processStream, messages.noResultError]
  );

  const reset = useCallback(() => {
    baseReset();
    setIsTracking(false);
    setLatestMessage(undefined);
    setResult(undefined);
    toastIdRef.current = undefined;
    onSuccessCallbackRef.current = undefined;
  }, [baseReset]);

  return {
    mutate,
    mutateAsync,
    isPending: mutation.isPending,
    isTracking,
    latestMessage,
    result,
    error: mutation.error,
    reset,
  };
}

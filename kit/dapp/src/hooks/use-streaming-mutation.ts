/**
 * Streaming Mutation Hook
 *
 * A simplified React hook that handles ORPC mutations returning AsyncIterable
 * responses. Preserves full type inference from ORPC.
 */

import type {
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

/**
 * Extract the result type from an async iterator of events
 * Handles AsyncIteratorObject (used by ORPC), AsyncGenerator and AsyncIterable types
 */
type ExtractResultType<T> =
  T extends AsyncIteratorObject<{ result?: infer R }>
    ? R
    : T extends AsyncGenerator<{ result?: infer R }, unknown>
      ? R
      : T extends AsyncIterable<{ result?: infer R }>
        ? R
        : never;

/**
 * Streaming mutation options that transform callbacks to work with extracted result
 */
interface StreamingMutationOptions<TData, TError, TVariables, TContext> {
  mutationOptions: UseMutationOptions<TData, TError, TVariables, TContext>;
  onSuccess?: (
    data: ExtractResultType<TData>,
    variables: TVariables,
    context: TContext
  ) => unknown;
}

/**
 * React hook for ORPC streaming mutations with automatic event processing.
 *
 * @example
 * ```tsx
 * const { mutate, isTracking } = useStreamingMutation({
 *   mutationOptions: orpc.system.create.mutationOptions(),
 *   onSuccess: (data) => {
 *     // data is properly typed as string (the system address)
 *     console.log("System created:", data);
 *   }
 * });
 *
 * // Call mutation with all messages
 * mutate({
 *   messages: {
 *     systemCreated: t("onboarding:create-system-messages.system-created"),
 *     creatingSystem: t("onboarding:create-system-messages.creating-system"),
 *     // ... other messages
 *   }
 * });
 * ```
 */
export function useStreamingMutation<
  TData,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(
  options: StreamingMutationOptions<TData, TError, TVariables, TContext>
): UseMutationResult<ExtractResultType<TData>, TError, TVariables, TContext> & {
  isTracking: boolean;
  latestMessage: string | null;
} {
  const [isTracking, setIsTracking] = useState(false);
  const [latestMessage, setLatestMessage] = useState<string | null>(null);
  const toastIdRef = useRef<string | number | undefined>(undefined);

  // Process async iterator events
  const processStream = useCallback(
    async (iterator: TData): Promise<ExtractResultType<TData>> => {
      setIsTracking(true);
      setLatestMessage(null);
      toastIdRef.current = undefined;

      let finalResult: ExtractResultType<TData> | undefined;

      try {
        const asyncIterable = iterator as AsyncIterable<{
          status: string;
          message: string;
          result?: ExtractResultType<TData>;
        }>;

        for await (const event of asyncIterable) {
          const message = event.message;
          setLatestMessage(message);

          // Access metadata if available
          const meta = Reflect.get(event, Symbol.for("orpc.event.meta")) as
            | { retry?: number }
            | undefined;

          switch (event.status) {
            case "pending":
              if (!toastIdRef.current) {
                toastIdRef.current = toast.loading(message || "Loading...");
              } else {
                toast.loading(message, { id: toastIdRef.current });
              }
              break;

            case "confirmed":
              if (event.result !== undefined) {
                finalResult = event.result;
              }
              toast.success(message || "Success", {
                id: toastIdRef.current,
                duration: meta?.retry ?? 5000,
              });
              break;

            case "completed":
              // Handle batch completion status
              if (event.result !== undefined) {
                finalResult = event.result;
              }
              toast.success(message || "Completed", {
                id: toastIdRef.current,
                duration: meta?.retry ?? 5000,
              });
              break;

            case "failed":
              toast.error(message || "Failed", {
                id: toastIdRef.current,
                duration: 5000,
              });
              throw new Error(message || "Operation failed");
          }
        }

        if (finalResult === undefined) {
          const errorMessage = "No result received";
          toast.error(errorMessage, { id: toastIdRef.current });
          throw new Error(errorMessage);
        }

        return finalResult;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An error occurred";
        toast.error(errorMessage, { id: toastIdRef.current });
        throw error;
      } finally {
        setIsTracking(false);
        toastIdRef.current = undefined;
      }
    },
    []
  );

  // Create mutation with streaming processor
  const mutation = useMutation<
    ExtractResultType<TData>,
    TError,
    TVariables,
    TContext
  >({
    mutationKey: options.mutationOptions.mutationKey,
    meta: options.mutationOptions.meta,
    mutationFn: async (variables: TVariables) => {
      const originalMutationFn = options.mutationOptions.mutationFn;
      if (!originalMutationFn) {
        throw new Error("Mutation function not found");
      }

      // Execute the original mutation to get the iterator
      const iterator = await originalMutationFn(variables);

      // Process the stream and return just the result field
      return processStream(iterator);
    },
    onMutate: options.mutationOptions.onMutate,
    onError: options.mutationOptions.onError,
    onSuccess: options.onSuccess,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSettled: options.mutationOptions.onSettled as any,
    retry: options.mutationOptions.retry,
    retryDelay: options.mutationOptions.retryDelay,
    networkMode: options.mutationOptions.networkMode,
    gcTime: options.mutationOptions.gcTime,
  });

  return {
    ...mutation,
    isTracking,
    latestMessage,
  };
}

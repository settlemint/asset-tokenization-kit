/**
 * Streaming Mutation Hook
 *
 * A simplified React hook that handles ORPC mutations returning AsyncIterable
 * responses. Preserves full type inference from ORPC.
 */

import { formatValidationError } from "@/lib/utils/format-validation-error";
import { createLogger } from "@settlemint/sdk-utils/logging";
import type {
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

const logger = createLogger();

/**
 * Extract the result type from an async iterator of events
 * Handles AsyncIteratorObject (used by ORPC), AsyncGenerator and AsyncIterable types
 *
 * TypeScript improvements in this PR:
 * - Added support for AsyncIteratorObject type which ORPC uses
 * - Uses conditional types with infer to extract nested result types
 * - Provides type safety for streaming mutation results
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
 *
 * TypeScript enhancements:
 * - The onSuccess callback receives the extracted result type, not the raw iterator
 * - This provides better developer experience with proper type hints
 * - Maintains full type inference from ORPC's mutation options
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
 * @param options
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
 * // Call mutation - messages are handled by i18n middleware on the backend
 * mutate({
 *   verification: {
 *     verificationCode: "123456",
 *     verificationType: "pincode"
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
        // Type assertion to access the async iterable events
        // The event structure matches ORPC's streaming response format
        const asyncIterable = iterator as AsyncIterable<{
          status: string;
          message: string;
          result?: ExtractResultType<TData>;
        }>;

        for await (const event of asyncIterable) {
          const message = event.message;
          setLatestMessage(message);

          // Access metadata if available using ORPC's symbol-based metadata
          // This provides type-safe access to retry counts and other event metadata
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
                duration: 10000, // Longer duration for failed operations
                description: "Check browser console for error details",
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
        let errorMessage = formatValidationError(error);

        // Extract detailed error information from ORPC errors
        if (
          error instanceof Error &&
          "cause" in error &&
          error.cause instanceof Error
        ) {
          errorMessage = `${errorMessage}\n\nDetails: ${error.cause.message}`;
        }

        // Show error with longer duration for debugging
        toast.error(errorMessage, {
          id: toastIdRef.current,
          duration: 10000, // 10 seconds to allow time to read detailed errors
          description: "Check browser console for full error details",
        });

        // Log full error details for debugging
        logger.error("Streaming mutation error", {
          message: errorMessage,
          error,
          cause: error instanceof Error ? error.cause : undefined,
          stack: error instanceof Error ? error.stack : undefined,
        });

        throw error;
      } finally {
        setIsTracking(false);
        toastIdRef.current = undefined;
      }
    },
    []
  );

  // Create mutation with streaming processor
  // TypeScript correctly infers the mutation result type as ExtractResultType<TData>
  // This ensures type safety throughout the mutation lifecycle
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
      // TypeScript ensures the return type matches ExtractResultType<TData>
      return processStream(iterator);
    },
    onMutate: options.mutationOptions.onMutate,
    onError: options.mutationOptions.onError,
    onSuccess: options.onSuccess,
    // Type assertion needed due to variance in callback parameter types
    // The extracted result type differs from the original TData type
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

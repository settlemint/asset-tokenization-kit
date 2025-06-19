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
 * Message configuration for translations
 */
interface MessageConfig {
  initialLoading?: string;
  noResultError?: string;
  defaultError?: string;
  messageMap?: Record<string, string>;
}

/**
 * Type helper to check if a type has a messages property
 */
type HasMessagesProperty<T> = T extends { messages: unknown } ? true : false;

/**
 * Extended message configuration that includes backend messages
 * Only available when TVariables has a messages property
 */
type ExtendedMessageConfig<
  TVariables,
  TMutationMessages = Record<string, string>,
> = MessageConfig &
  (HasMessagesProperty<TVariables> extends true
    ? { mutationMessages?: TMutationMessages }
    : { mutationMessages?: never });

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
interface StreamingMutationOptions<
  TData,
  TError,
  TVariables,
  TContext,
  TMutationMessages = Record<string, string>,
> {
  mutationOptions: UseMutationOptions<TData, TError, TVariables, TContext>;
  onSuccess?: (
    data: ExtractResultType<TData>,
    variables: TVariables,
    context: TContext
  ) => unknown;
  messages?: ExtendedMessageConfig<TVariables, TMutationMessages>;
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
 *   },
 *   messages: {
 *     // Frontend messages
 *     initialLoading: t("onboarding:create-system-messages.initial-loading"),
 *     noResultError: t("onboarding:create-system-messages.no-result-error"),
 *     defaultError: t("onboarding:create-system-messages.default-error"),
 *     // Backend messages that will be passed to the mutation
 *     mutationMessages: {
 *       systemCreated: t("onboarding:create-system-messages.system-created"),
 *       creatingSystem: t("onboarding:create-system-messages.creating-system"),
 *       // ... other messages
 *     }
 *   }
 * });
 * ```
 */
export function useStreamingMutation<
  TData,
  TError = Error,
  TVariables = void,
  TContext = unknown,
  TMutationMessages = Record<string, string>,
>(
  options: StreamingMutationOptions<
    TData,
    TError,
    TVariables,
    TContext,
    TMutationMessages
  >
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

      const messages = options.messages ?? {};

      try {
        const asyncIterable = iterator as AsyncIterable<{
          status: string;
          message: string;
          result?: ExtractResultType<TData>;
        }>;

        for await (const event of asyncIterable) {
          // Translate message if mapping provided
          const message = messages.messageMap?.[event.message] ?? event.message;

          setLatestMessage(message);

          // Access metadata if available
          const meta = Reflect.get(event, Symbol.for("orpc.event.meta")) as
            | { retry?: number }
            | undefined;

          switch (event.status) {
            case "pending":
              if (!toastIdRef.current) {
                const loadingMessage =
                  message || (messages.initialLoading ?? "Loading...");
                toastIdRef.current = toast.loading(loadingMessage);
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

            case "failed":
              toast.error(message || "Failed", {
                id: toastIdRef.current,
                duration: 5000,
              });
              throw new Error(message || "Operation failed");
          }
        }

        if (finalResult === undefined) {
          const errorMessage = messages.noResultError ?? "No result received";
          toast.error(errorMessage, { id: toastIdRef.current });
          throw new Error(errorMessage);
        }

        return finalResult;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : (messages.defaultError ?? "An error occurred");
        toast.error(errorMessage, { id: toastIdRef.current });
        throw error;
      } finally {
        setIsTracking(false);
        toastIdRef.current = undefined;
      }
    },
    [options.messages]
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

      // Type-safe message injection
      let enhancedVariables = variables;

      // Only inject messages if TVariables has a messages property
      if (
        options.messages?.mutationMessages &&
        "messages" in (variables as object)
      ) {
        // Safe to inject because we've checked the property exists
        enhancedVariables = {
          ...variables,
          messages: options.messages.mutationMessages,
        };
      } else if (options.messages?.mutationMessages) {
        // Log warning in development if messages were provided but can't be injected
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "mutationMessages were provided but the mutation variables do not have a messages property. " +
              "Messages will not be passed to the mutation."
          );
        }
      }

      // Execute the original mutation to get the iterator
      const iterator = await originalMutationFn(enhancedVariables);

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

import type { TOptions } from "i18next";

/**
 * Standard message keys for mutations
 */
export interface MutationMessageKeys {
  preparing?: string;
  success: string;
  failed?: string;
}

/**
 * Generated mutation messages
 */
export interface MutationMessages {
  pendingMessage: string;
  successMessage: string;
  errorMessage: string;
}

/**
 * Generates standard mutation messages for a given action.
 *
 * This helper reduces code duplication by providing a consistent way to generate
 * the three standard messages (pending, success, error) used across mutation handlers.
 *
 * @param t - The translation function from context
 * @param namespace - The i18n namespace (e.g., "tokens", "system")
 * @param action - The action name (e.g., "mint", "pause", "burn")
 * @param options - Optional configuration
 * @returns The three standard messages
 *
 * @example
 * ```typescript
 * // Basic usage
 * const messages = getMutationMessages(t, "tokens", "mint");
 * // Returns:
 * // {
 * //   pendingMessage: t("tokens:actions.mint.messages.preparing"),
 * //   successMessage: t("tokens:actions.mint.messages.success"),
 * //   errorMessage: t("tokens:actions.mint.messages.failed")
 * // }
 *
 * // With suffix for batch operations
 * const batchMessages = getMutationMessages(t, "tokens", "mint", {
 *   suffix: "Batch"
 * });
 * // Returns:
 * // {
 * //   pendingMessage: t("tokens:actions.mint.messages.preparingBatch"),
 * //   successMessage: t("tokens:actions.mint.messages.successBatch"),
 * //   errorMessage: t("tokens:actions.mint.messages.failedBatch")
 * // }
 *
 * // With custom message keys
 * const customMessages = getMutationMessages(t, "system", "create", {
 *   keys: {
 *     preparing: "creating",
 *     success: "created",
 *     failed: "creationFailed"
 *   }
 * });
 * ```
 */
export function getMutationMessages(
  t: (key: string, options?: TOptions) => string,
  namespace: string,
  action: string,
  options?: {
    /**
     * Suffix to append to message keys (e.g., "Batch" for batch operations)
     */
    suffix?: string;
    /**
     * Custom message keys to override defaults
     */
    keys?: MutationMessageKeys;
    /**
     * Translation options to pass to the t function
     */
    translationOptions?: TOptions;
  }
): MutationMessages {
  const suffix = options?.suffix ?? "";
  const keys = options?.keys;
  const tOptions = options?.translationOptions;

  // Default keys
  const preparingKey = keys?.preparing ?? "preparing";
  const successKey = keys?.success ?? "success";
  const failedKey = keys?.failed ?? "failed";

  // Build translation keys
  const basePath = `${namespace}:actions.${action}.messages`;

  return {
    pendingMessage: t(`${basePath}.${preparingKey}${suffix}`, tOptions),
    successMessage: t(`${basePath}.${successKey}${suffix}`, tOptions),
    errorMessage: t(`${basePath}.${failedKey}${suffix}`, tOptions),
  };
}

/**
 * Generates mutation messages with conditional suffix based on a boolean flag.
 * Useful for operations that have different messages for single vs batch operations.
 *
 * @param t - The translation function from context
 * @param namespace - The i18n namespace
 * @param action - The action name
 * @param isBatch - Whether this is a batch operation
 * @param options - Additional options
 * @returns The three standard messages
 *
 * @example
 * ```typescript
 * const isBatch = recipients.length > 1;
 * const messages = getConditionalMutationMessages(
 *   t, "tokens", "mint", isBatch
 * );
 * ```
 */
export function getConditionalMutationMessages(
  t: (key: string, options?: TOptions) => string,
  namespace: string,
  action: string,
  isBatch: boolean,
  options?: Omit<Parameters<typeof getMutationMessages>[3], "suffix">
): MutationMessages {
  return getMutationMessages(t, namespace, action, {
    ...options,
    suffix: isBatch ? "Batch" : "",
  });
}

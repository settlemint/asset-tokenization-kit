import type { TranslationValues } from 'next-intl';
import { toast } from 'sonner';

/**
 * Error with additional context for better error handling
 */
export interface ExtendedError extends Error {
  code?: string;
  context?: Record<string, unknown>;
}

/**
 * Options for displaying an error toast
 */
export interface ErrorToastOptions {
  /** Optional description to display below the main error message */
  description?: string;
  /** Whether the toast should be dismissible */
  dismissible?: boolean;
  /** Duration in milliseconds for the toast to be visible */
  duration?: number;
}

/**
 * Function to get an error code from any error type
 *
 * @param error - The error to get the code from
 * @returns The error code or 'unknown' if none is found
 */
export function getErrorCode(error: unknown): string {
  if (
    error instanceof Error &&
    'code' in error &&
    typeof (error as any).code === 'string'
  ) {
    return (error as ExtendedError).code || 'unknown';
  }

  return 'unknown';
}

/**
 * Function to get error context from any error type
 *
 * @param error - The error to get the context from
 * @returns The error context or an empty object if none is found
 */
export function getErrorContext(error: unknown): Record<string, unknown> {
  if (
    error instanceof Error &&
    'context' in error &&
    typeof (error as any).context === 'object'
  ) {
    return (error as ExtendedError).context || {};
  }

  return {};
}

/**
 * Function to handle and display a translated error message
 *
 * @param error - The error object to handle
 * @param t - The translation function from next-intl
 * @param options - Options for the error toast
 */
export function handleTranslatedError(
  error: unknown,
  t: (key: string, values?: TranslationValues) => string,
  options?: ErrorToastOptions
) {
  const toastData = getTranslatedError(error, t, options);
  toast.error(toastData.message, {
    description: toastData.description,
    dismissible: toastData.dismissible,
    duration: toastData.duration,
  });
}

/**
 * Function to process an error and return toast data without displaying it
 *
 * @param error - The error object to process
 * @param t - The translation function from next-intl
 * @param options - Options for the error toast
 * @returns Object containing the processed toast data
 */
export function getTranslatedError(
  error: unknown,
  t: (key: string, values?: TranslationValues) => string,
  options?: ErrorToastOptions
) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorCode = getErrorCode(error);
  const errorContext = getErrorContext(error);

  let message = errorMessage;

  try {
    // Try to get a translated error message based on the error code
    message = t(`${errorCode}`, {
      defaultValue: errorMessage,
      ...errorContext,
    });
  } catch {
    // Fallback if translation fails - use original error message
  }

  return {
    message,
    description: options?.description,
    dismissible: options?.dismissible ?? true,
    duration: options?.duration ?? 5000,
  };
}

/**
 * Function to create a custom error with a code and context
 *
 * @param message - The error message
 * @param code - The error code
 * @param context - Additional context for the error
 * @returns A new ExtendedError
 */
export function createError(
  message: string,
  code: string,
  context?: Record<string, unknown>
): ExtendedError {
  const error = new Error(message) as ExtendedError;
  error.code = code;
  error.context = context;
  return error;
}

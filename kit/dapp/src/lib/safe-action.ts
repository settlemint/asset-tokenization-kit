import { createSafeActionClient } from 'next-safe-action';
import { z } from 'zod';

/**
 * Standard error type for safe actions
 */
export type ActionError = {
  code: string;
  message: string;
  context?: Record<string, unknown>;
};

/**
 * Creates a standardized error response
 */
function createErrorResponse(code: string, message: string, context?: Record<string, unknown>): ActionError {
  return { code, message, context };
}

/**
 * Development-only console logging
 */
const devLog = {
  debug: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.debug(...args);
    }
  },
  error: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.error(...args);
    }
  },
};

export const actionClient = createSafeActionClient({
  handleServerError(e: Error) {
    // Handle known error types
    if (e instanceof z.ZodError) {
      return createErrorResponse('VALIDATION_ERROR', 'Invalid input data', { details: e.errors });
    }

    // Log unexpected errors in development
    devLog.error('Server action error:', e);

    // Return sanitized error for client
    return createErrorResponse(
      'INTERNAL_ERROR',
      'An unexpected error occurred',
      process.env.NODE_ENV === 'development' ? { details: e.message } : undefined
    );
  },
});

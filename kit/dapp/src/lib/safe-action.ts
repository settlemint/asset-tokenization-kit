import { getAuthenticatedUser } from '@/lib/auth/auth';
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

const handleServerError = (error: Error) => {
  if (error instanceof z.ZodError) {
    // Handle known error types
    devLog.error('Server action validation error:', error);
    return createErrorResponse('VALIDATION_ERROR', 'Invalid input data', { details: error.errors });
  }

  // Log unexpected errors in development
  devLog.error('Server action error:', error);

  // Return sanitized error for client
  return createErrorResponse(
    'INTERNAL_ERROR',
    'An unexpected error occurred',
    process.env.NODE_ENV === 'development' ? { details: error.message } : undefined
  );
};

export const actionClient = createSafeActionClient({
  handleServerError,
})
  .use(async ({ next, clientInput, metadata }) => {
    const result = await next({ ctx: undefined });
    devLog.debug('Input ->', clientInput);
    devLog.debug('Result ->', result.data);
    devLog.debug('Metadata ->', metadata);
    return result;
  })
  .use(async ({ next }) => {
    const user = await getAuthenticatedUser();

    return next({
      ctx: {
        user,
      },
    });
  });

export const publicActionClient = createSafeActionClient({
  handleServerError,
}).use(async ({ next, clientInput, metadata }) => {
  const result = await next({ ctx: undefined });
  devLog.debug('Input ->', clientInput);
  devLog.debug('Result ->', result.data);
  devLog.debug('Metadata ->', metadata);
  return result;
});

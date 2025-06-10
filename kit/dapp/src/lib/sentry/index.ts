import * as Sentry from "@sentry/nextjs";
import type { User } from "@/lib/auth/types";

/**
 * Set user context in Sentry for better error tracking
 *
 * @param user - The authenticated user object
 */
export function setSentryUser(user: User | null) {
  if (!user) {
    Sentry.setUser(null);
    return;
  }

  Sentry.setUser({
    id: user.id,
    email: user.email || undefined,
    username: user.name || undefined,
  });

  // Set additional context
  Sentry.setTag("user.role", user.role);
  Sentry.setTag("user.verified", user.emailVerified ? "true" : "false");
}

/**
 * Add custom context to Sentry for better debugging
 *
 * @param context - Additional context to attach to errors
 */
export function setSentryContext(context: Record<string, any>) {
  Sentry.setContext("custom", context);
}

/**
 * Create a breadcrumb for user actions
 *
 * @param message - The breadcrumb message
 * @param data - Additional data to attach
 */
export function addActionBreadcrumb(
  message: string,
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    category: "user-action",
    message,
    level: "info",
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Track a business metric or event
 *
 * @param name - The metric name
 * @param value - The metric value
 * @param tags - Additional tags
 */
export function trackMetric(
  name: string,
  value: number,
  tags?: Record<string, string>
) {
  if (!Sentry.getClient()) return;

  // For now, use custom context instead of metrics API
  // The metrics API might not be available in all Sentry SDKs
  Sentry.setContext("metrics", {
    [name]: value,
    ...tags,
  });
}

/**
 * Capture a message with additional context
 *
 * @param message - The message to capture
 * @param level - The severity level
 * @param context - Additional context
 */
export function captureMessage(
  message: string,
  level: "fatal" | "error" | "warning" | "log" | "info" | "debug" = "info",
  context?: Record<string, any>
) {
  Sentry.captureMessage(message, {
    level,
    contexts: context ? { additional: context } : undefined,
  });
}

/**
 * Capture an exception with enhanced context
 *
 * @param error - The error to capture
 * @param context - Additional context about where/how the error occurred
 */
export function captureException(
  error: unknown,
  context?: {
    operation?: string;
    userId?: string;
    metadata?: Record<string, any>;
    tags?: Record<string, string>;
  }
) {
  Sentry.captureException(error, {
    contexts: context?.metadata ? { operation: context.metadata } : undefined,
    tags: {
      ...context?.tags,
      operation: context?.operation,
    },
    user: context?.userId ? { id: context.userId } : undefined,
  });
}

/**
 * Create a monitored async function that automatically tracks performance and errors
 *
 * @param name - The name of the operation
 * @param fn - The async function to monitor
 * @returns The monitored function
 */
export function monitoredAsync<T extends (...args: any[]) => Promise<any>>(
  name: string,
  fn: T
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const transaction = Sentry.startInactiveSpan({
      name,
      op: "function",
    });

    try {
      const result = await fn(...args);
      transaction.setStatus({ code: 1, message: "ok" });
      return result;
    } catch (error) {
      transaction.setStatus({ code: 2, message: "internal_error" });
      captureException(error, { operation: name });
      throw error;
    } finally {
      transaction.end();
    }
  }) as T;
}

/**
 * Initialize Sentry user session tracking
 * Call this when a user logs in
 */
export function startSentrySession() {
  if (Sentry.getClient()) {
    Sentry.startSession();
  }
}

/**
 * End Sentry user session tracking
 * Call this when a user logs out
 */
export function endSentrySession() {
  if (Sentry.getClient()) {
    Sentry.endSession();
  }
}

// Re-export commonly used Sentry functions
export {
  withScope,
  captureEvent,
  flush,
  close,
  lastEventId,
  getCurrentScope,
  startSpan,
  setMeasurement,
} from "@sentry/nextjs";

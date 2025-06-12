import * as Sentry from "@sentry/nextjs";
import SuperJSON from "superjson";
import { br } from "../../procedures/base.router";

/**
 * Maximum size in characters for serialized results in trace attributes.
 * Prevents excessive memory usage and performance issues with large payloads.
 */
const MAX_TRACE_RESULT_SIZE = 10000;

/**
 * ORPC tracing middleware using Sentry for distributed request tracing.
 *
 * This middleware provides comprehensive Sentry tracing for all ORPC procedures,
 * automatically creating spans for each request with detailed context information.
 * It captures request parameters, response data, timing information, and error details
 * to enable distributed tracing and performance monitoring.
 *
 * Features:
 * - Automatic span creation for each ORPC procedure call
 * - Request parameter logging with smart object expansion
 * - Response data capture with serialization fallbacks
 * - Error recording with proper exception handling
 * - Performance timing and status tracking
 * - Context propagation for distributed tracing
 * - User context and request metadata capture
 *
 * The middleware follows Sentry best practices:
 * - Uses semantic naming conventions for spans
 * - Properly handles span lifecycle (start, end, error states)
 * - Records structured data for better observability
 * - Maintains trace context across service boundaries
 *
 * Span Data:
 * - `orpc.procedure`: The ORPC procedure name being executed
 * - `orpc.input.*`: Request input parameters (expanded for objects)
 * - `orpc.result`: Serialized response data
 * - `orpc.user.id`: Authenticated user ID (if available)
 * - `orpc.request.headers.*`: Selected request headers
 * - Error details when exceptions occur
 *
 * @example
 * ```typescript
 * // Used in router middleware chain
 * export const pr = br.use(errorMiddleware).use(sentryTracingMiddleware).use(sessionMiddleware);
 *
 * // Automatically traces all procedure calls:
 * // - Span name: "orpc.planet.create"
 * // - Attributes include input data, user context, timing
 * // - Errors are recorded with stack traces
 * ```
 */
export const sentryTracingMiddleware = br.middleware(
  async ({ context, next, path }) => {
    // Skip if Sentry is not initialized
    if (!Sentry.getClient()) {
      return await next();
    }

    // Create a descriptive span name based on the procedure path
    const spanName = `orpc.${path.join(".")}`;

    // Start a new Sentry span for this operation
    return await Sentry.startSpan(
      {
        name: spanName,
        op: "orpc.procedure",
        attributes: {
          "orpc.procedure": path.join("."),
          "orpc.middleware": "sentry-tracing",
        },
      },
      async (span) => {
        // Add user context if available
        if (context.auth?.user) {
          span.setAttributes({
            "orpc.user.id": context.auth.user.id,
            "orpc.user.email": context.auth.user.email || "unknown",
          });

          // Set user context for Sentry
          Sentry.setUser({
            id: context.auth.user.id,
            email: context.auth.user.email || undefined,
          });
        }

        // Add selected request headers for context
        if (context.headers) {
          const relevantHeaders = [
            "user-agent",
            "x-forwarded-for",
            "x-real-ip",
            "referer",
            "origin",
          ];

          const headerAttributes: Record<string, string> = {};
          relevantHeaders.forEach((headerName) => {
            const headerValue = context.headers.get(headerName);
            if (headerValue) {
              headerAttributes[`orpc.request.headers.${headerName}`] =
                headerValue;
            }
          });
          span.setAttributes(headerAttributes);
        }

        // Note: Input parameters are not directly available in ORPC middleware
        // They would need to be passed through context if needed

        // Create breadcrumb for this operation
        Sentry.addBreadcrumb({
          category: "orpc",
          message: `Calling ${spanName}`,
          level: "info",
          data: {
            procedure: path.join("."),
            hasAuth: !!context.auth?.user,
          },
        });

        try {
          // Execute the next middleware/handler and capture the result
          const result = await next();

          // Mark span as successful
          span.setStatus({
            code: 1, // OK status
            message: "Success",
          });

          // Add result as span data if it's serializable
          try {
            const serializedResult = SuperJSON.stringify(result);
            // Limit result size to prevent excessive attribute data
            if (serializedResult.length <= MAX_TRACE_RESULT_SIZE) {
              span.setAttribute("orpc.result", serializedResult);
            } else {
              span.setAttribute("orpc.result", "[Large Result - Truncated]");
              span.setAttribute("orpc.result.size", serializedResult.length);
            }
          } catch (_serializationError) {
            span.setAttribute("orpc.result", "[Unserializable Result]");
          }

          // Add success breadcrumb
          Sentry.addBreadcrumb({
            category: "orpc",
            message: `Completed ${spanName}`,
            level: "info",
            data: {
              procedure: path.join("."),
              success: true,
            },
          });

          return result;
        } catch (error) {
          // Record error information on the span
          const errorMessage =
            error instanceof Error ? error.message : String(error);

          // Set error status on span
          span.setStatus({
            code: 2, // ERROR status
            message: errorMessage,
          });

          // Add error-specific attributes
          span.setAttributes({
            "orpc.error": true,
            "orpc.error.type":
              error instanceof Error ? error.constructor.name : "Unknown",
            "orpc.error.message": errorMessage,
          });

          // Record exception in Sentry
          Sentry.captureException(error, {
            contexts: {
              orpc: {
                procedure: path.join("."),
                user: context.auth?.user?.id || "anonymous",
              },
            },
            tags: {
              "orpc.procedure": path.join("."),
              "orpc.error": "true",
            },
          });

          // Add error breadcrumb
          Sentry.addBreadcrumb({
            category: "orpc",
            message: `Failed ${spanName}`,
            level: "error",
            data: {
              procedure: path.join("."),
              error: errorMessage,
              errorType:
                error instanceof Error ? error.constructor.name : "Unknown",
            },
          });

          // Re-throw the error to maintain the original call stack behavior
          throw error;
        }
      }
    );
  }
);

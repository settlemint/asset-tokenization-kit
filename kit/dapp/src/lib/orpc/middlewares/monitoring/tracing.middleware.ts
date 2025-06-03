import { br } from "@/lib/orpc/routes/procedures/base.router";
import { SpanStatusCode, trace, type Attributes } from "@opentelemetry/api";
import SuperJSON from "superjson";

/**
 * ORPC tracing middleware for distributed request tracing.
 *
 * This middleware provides comprehensive OpenTelemetry tracing for all ORPC procedures,
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
 * - Configurable attribute extraction from request context
 *
 * The middleware follows OpenTelemetry best practices:
 * - Uses semantic naming conventions for spans
 * - Properly handles span lifecycle (start, end, error states)
 * - Records structured attributes for better observability
 * - Maintains trace context across service boundaries
 *
 * Span Attributes:
 * - `orpc.procedure`: The ORPC procedure name being executed
 * - `orpc.input.*`: Request input parameters (expanded for objects)
 * - `orpc.result`: Serialized response data
 * - `orpc.user.id`: Authenticated user ID (if available)
 * - `orpc.request.headers.*`: Selected request headers
 * - `http.method`: HTTP method (for HTTP-based calls)
 * - `http.url`: Request URL (for HTTP-based calls)
 *
 * @example
 * ```typescript
 * // Used in router middleware chain
 * export const pr = br.use(errorMiddleware).use(tracingMiddleware).use(sessionMiddleware);
 *
 * // Automatically traces all procedure calls:
 * // - Span name: "orpc.planet.create"
 * // - Attributes include input data, user context, timing
 * // - Errors are recorded with stack traces
 * ```
 *
 * @see {@link @/lib/utils/tracing} - Base tracing utilities
 * @see {@link ../../routes/procedures/base.router} - Base router implementation
 */
export const tracingMiddleware = br.middleware(
  async ({ context, next, path }) => {
    const tracer = trace.getTracer("orpc");

    // Create a descriptive span name based on the procedure path
    const spanName = `orpc.${path.join(".")}`;

    return await tracer.startActiveSpan(spanName, async (span) => {
      // Set initial span attributes
      const initialAttributes: Attributes = {
        "orpc.procedure": path.join("."),
        "orpc.middleware": "tracing",
      };

      // Add user context if available
      if (context.auth?.user) {
        initialAttributes["orpc.user.id"] = context.auth.user.id;
        initialAttributes["orpc.user.email"] =
          context.auth.user.email || "unknown";
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

        relevantHeaders.forEach((headerName) => {
          const headerValue = context.headers.get(headerName);
          if (headerValue) {
            initialAttributes[`orpc.request.headers.${headerName}`] =
              headerValue;
          }
        });
      }

      span.setAttributes(initialAttributes);

      try {
        // Execute the next middleware/handler and capture the result
        const result = await next();

        // Mark span as successful
        span.setStatus({ code: SpanStatusCode.OK });

        // Add result as an attribute if it's serializable
        try {
          const serializedResult = SuperJSON.stringify(result);
          // Limit result size to prevent excessive attribute data
          if (serializedResult.length <= 10000) {
            span.setAttribute("orpc.result", serializedResult);
          } else {
            span.setAttribute("orpc.result", "[Large Result - Truncated]");
            span.setAttribute("orpc.result.size", serializedResult.length);
          }
        } catch (serializationError) {
          span.setAttribute("orpc.result", "[Unserializable Result]");
          span.setAttribute("orpc.result.error", String(serializationError));
        }

        return result;
      } catch (error) {
        // Record error information on the span
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        if (error instanceof Error) {
          span.recordException(error);
        } else {
          // Record non-Error throws as a generic error
          span.recordException(new Error(errorMessage));
        }

        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: errorMessage.substring(0, 1000), // Limit message length
        });

        // Add error-specific attributes
        span.setAttributes({
          "orpc.error": true,
          "orpc.error.type":
            error instanceof Error ? error.constructor.name : "Unknown",
          "orpc.error.message": errorMessage,
        });

        // Re-throw the error to maintain the original call stack behavior
        throw error;
      } finally {
        // Ensure the span is always ended
        span.end();
      }
    });
  }
);

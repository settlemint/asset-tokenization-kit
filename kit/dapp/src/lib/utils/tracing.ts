import { SpanStatusCode, trace, type Attributes } from "@opentelemetry/api";

/**
 * Wraps an asynchronous function with OpenTelemetry tracing.
 *
 * This utility takes an async function, wraps its execution within an
 * OpenTelemetry span, and returns a new async function with the exact
 * same type signature (parameters and return type). It automatically
 * handles span creation, ending, status setting, and error recording.
 *
 * @template T - The type of the async function being wrapped. Must be a function returning a Promise.
 * @param {string} spanName - The name to assign to the OpenTelemetry span.
 * @param {T} fn - The asynchronous function to wrap with tracing.
 * @param {Attributes} [attributes] - Optional attributes to add to the span upon creation.
 * @returns {T} A new asynchronous function that includes tracing logic but matches the original function's signature.
 *
 * @example
 * async function fetchData(id: string): Promise<{ data: string }> {
 *   // ... fetch logic
 *   return { data: `data for ${id}` };
 * }
 *
 * const tracedFetchData = withTracing('fetchDataSpan', fetchData);
 *
 * // tracedFetchData has the same signature: (id: string) => Promise<{ data: string }>
 * const result = await tracedFetchData("user-123");
 */
export function withTracing<T extends (...args: any[]) => Promise<any>>(
  tracerName: string,
  spanName: string,
  fn: T,
  attributes?: Attributes
): T {
  const tracer = trace.getTracer(tracerName);

  // Return a new async function that preserves the original signature
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    // Start an active span for the duration of the wrapped function's execution
    return await tracer.startActiveSpan(spanName, async (span) => {
      // Set initial attributes if provided
      if (attributes) {
        span.setAttributes(attributes);
      }

      try {
        // Execute the original function with its arguments
        const result = await fn(...args);
        // Set span status to OK on successful completion
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        // If an error occurs, record it on the span
        if (error instanceof Error) {
          span.recordException(error);
          // Set span status to ERROR with the error message
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message,
          });
        } else {
          // Handle cases where non-Error objects are thrown
          const unknownError = new Error(String(error));
          span.recordException(unknownError);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: unknownError.message,
          });
        }
        // Re-throw the error to ensure the original call stack behavior is maintained
        throw error;
      } finally {
        // Ensure the span is always ended, regardless of success or failure
        span.end();
      }
    });
    // Type assertion is used here to assure TypeScript that the returned function
    // matches the original function's signature T, even though the internal
    // implementation involves wrapping.
  }) as T;
}

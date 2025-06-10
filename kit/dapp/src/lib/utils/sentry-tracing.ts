import * as Sentry from "@sentry/nextjs";
import SuperJSON from "superjson";

/**
 * Wraps an asynchronous function with Sentry tracing.
 *
 * This utility takes an async function, wraps its execution within a
 * Sentry span, and returns a new async function with the exact same
 * type signature. It automatically handles span creation, ending,
 * status setting, error recording, and detailed argument/result logging.
 *
 * Argument Handling:
 * - If an argument is a plain object, its keys are expanded into span data
 *   prefixed with `arg.{index}.` (e.g., `arg.0.userId`, `arg.1.settingName`).
 * - If an argument is not a plain object (e.g., string, number, array, null),
 *   it's logged directly under `arg.{index}` (e.g., `arg.1`, `arg.2`).
 * The function result is logged under the `result` attribute.
 * Both arguments and results are stringified, with fallbacks for serialization errors.
 *
 * @template T - The type of the async function being wrapped. Must be a function returning a Promise.
 * @param {string} tracerName - The name of the tracer (e.g., 'queries')
 * @param {string} spanName - The name to assign to the Sentry span (e.g., 'database-query')
 * @param {T} fn - The asynchronous function to wrap with tracing
 * @param {Record<string, any>} [initialAttributes] - Optional attributes to add to the span upon creation
 * @returns {T} A new asynchronous function that includes tracing logic but matches the original function's signature
 *
 * @example
 * async function processData(config: { id: string; active: boolean }, items: string[], count: number): Promise<{ status: string }> {
 *   // ... processing logic
 *   return { status: "completed" };
 * }
 *
 * const tracedProcessData = withTracing(
 *   'data-processor',
 *   'processDataSpan',
 *   processData,
 *   { region: 'us-east-1' }
 * );
 *
 * // Call the traced function:
 * await tracedProcessData({ id: "job-5", active: true }, ["apple", "banana"], 42);
 * // Span attributes will include:
 * // - region: 'us-east-1'
 * // - arg.0.id: 'job-5'
 * // - arg.0.active: 'true'
 * // - arg.1: '["apple","banana"]' // Array stringified
 * // - arg.2: '42'
 * // - result: '{"status":"completed"}' // Serialized result
 */
export function withTracing<T extends (...args: any[]) => Promise<any>>(
  tracerName: "queries" | string,
  spanName: string,
  fn: T,
  initialAttributes?: Record<string, any>
): T {
  // Return a new async function that preserves the original signature
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    // Skip if Sentry is not initialized
    if (!Sentry.getClient()) {
      return await fn(...args);
    }

    // Start a Sentry span for the duration of the wrapped function's execution
    return await Sentry.startSpan(
      {
        name: spanName,
        op: `${tracerName}.function`,
        attributes: initialAttributes || {},
      },
      async (span) => {
        // --- Argument Processing Logic ---
        const argAttributes: Record<string, any> = {};
        args.forEach((arg, index) => {
          const prefix = `arg.${index}`;
          try {
            if (
              typeof arg === "object" &&
              arg !== null &&
              !Array.isArray(arg)
            ) {
              // If the argument is a plain object, iterate its keys
              for (const key in arg) {
                if (Object.prototype.hasOwnProperty.call(arg, key)) {
                  const value = arg[key];
                  const attributeKey = `${prefix}.${key}`;
                  try {
                    argAttributes[attributeKey] =
                      typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value);
                  } catch {
                    argAttributes[attributeKey] = String(value);
                  }
                }
              }
            } else {
              // Handle non-object arguments (or arrays, null)
              try {
                argAttributes[prefix] =
                  typeof arg === "object" && arg !== null
                    ? JSON.stringify(arg)
                    : String(arg);
              } catch {
                argAttributes[prefix] = String(arg);
              }
            }
          } catch (e) {
            console.error(`Error processing argument ${index} for tracing:`, e);
            argAttributes[`error.${prefix}`] =
              `Failed to process: ${String(e)}`;
            try {
              argAttributes[prefix] = String(arg);
            } catch {
              argAttributes[prefix] = "[Unserializable Argument]";
            }
          }
        });
        span.setAttributes(argAttributes);

        // Add breadcrumb for function call
        Sentry.addBreadcrumb({
          category: tracerName,
          message: `Calling ${spanName}`,
          level: "info",
          data: {
            hasArgs: args.length > 0,
            argCount: args.length,
          },
        });

        try {
          // Execute the original function with its arguments
          const result = await fn(...args);

          // Mark span as successful
          span.setStatus({ code: 1, message: "Success" });

          // Add result as span data if it's serializable
          try {
            span.setAttribute("result", SuperJSON.stringify(result));
          } catch {
            span.setAttribute("result", "[Unserializable Result]");
          }

          // Add success breadcrumb
          Sentry.addBreadcrumb({
            category: tracerName,
            message: `Completed ${spanName}`,
            level: "info",
          });

          return result;
        } catch (error) {
          // If an error occurs, record it on the span
          const errorMessage =
            error instanceof Error ? error.message : String(error);

          // Set error status
          span.setStatus({
            code: 2,
            message: errorMessage.substring(0, 1000), // Limit message length
          });

          // Capture exception with context
          Sentry.captureException(error, {
            contexts: {
              function: {
                name: spanName,
                tracer: tracerName,
                argCount: args.length,
              },
            },
            tags: {
              [`${tracerName}.function`]: spanName,
              [`${tracerName}.error`]: "true",
            },
          });

          // Add error breadcrumb
          Sentry.addBreadcrumb({
            category: tracerName,
            message: `Failed ${spanName}`,
            level: "error",
            data: {
              error: errorMessage,
              errorType:
                error instanceof Error ? error.constructor.name : "Unknown",
            },
          });

          // Re-throw the error to ensure the original call stack behavior is maintained
          throw error;
        }
      }
    );
    // Type assertion is used here to assure TypeScript that the returned function
    // matches the original function's signature T, even though the internal
    // implementation involves wrapping.
  }) as T;
}

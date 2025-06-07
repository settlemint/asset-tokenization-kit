import { oc } from "@orpc/contract";
import { z } from "zod";

/**
 * Base ORPC contract with common error definitions.
 *
 * This contract serves as the foundation for all other contracts in the application,
 * defining standard error types that can occur across any API procedure. These
 * errors follow HTTP status code conventions and provide consistent error handling
 * throughout the application.
 *
 * All other contracts should extend this base contract to inherit these common
 * error definitions, ensuring consistent error responses across the entire API.
 */
export const bc = oc.errors({
  /**
   * Input validation failure error.
   *
   * Thrown when request data fails schema validation, typically due to:
   * - Missing required fields
   * - Invalid data types
   * - Values outside allowed ranges
   * - Malformed input data
   *
   * Returns detailed validation errors to help clients fix their requests.
   */
  INPUT_VALIDATION_FAILED: {
    status: 422,
    message: "Input validation failed",
    data: z.object({
      errors: z.array(z.string()),
    }),
  },

  /**
   * Output validation failure error.
   *
   * Thrown when server response data fails schema validation, indicating:
   * - Internal data corruption
   * - Schema mismatches between database and API
   * - Unexpected data transformations
   *
   * This is typically a server-side issue that should be logged and investigated.
   */
  OUTPUT_VALIDATION_FAILED: {
    status: 522,
    message: "Output validation failed",
    data: z.object({
      errors: z.array(z.string()),
    }),
  },

  /**
   * Generic internal server error.
   *
   * Thrown for unexpected server-side errors that don't fit other categories:
   * - Database connection failures
   * - External service timeouts
   * - Unhandled exceptions
   * - System resource exhaustion
   *
   * Details are typically logged server-side but not exposed to clients for security.
   */
  INTERNAL_SERVER_ERROR: {
    status: 500,
    message: "Internal server error",
  },

  /**
   * Rate limiting exceeded error.
   *
   * Thrown when a client exceeds the allowed request rate, helping to:
   * - Prevent API abuse
   * - Protect server resources
   * - Ensure fair usage across all clients
   *
   * Includes retry-after information to guide client backoff strategies.
   */
  RATE_LIMIT_EXCEEDED: {
    status: 429,
    message: "Too many requests. Please try again later.",
    data: z.object({
      retryAfter: z.string(),
    }),
  },

  /**
   * Access forbidden error.
   *
   * Thrown when an authenticated user lacks permission for the requested operation:
   * - Insufficient role or permissions
   * - Resource access restrictions
   * - Feature not available for user's plan/tier
   *
   * Different from UNAUTHORIZED - user is authenticated but not authorized.
   */
  FORBIDDEN: {
    status: 403,
    message: "Forbidden",
  },
});

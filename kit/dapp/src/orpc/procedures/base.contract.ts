import { oc } from "@orpc/contract";
import { oo } from "@orpc/openapi";
import { z } from "zod/v4";

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
export const baseContract = oc.errors({
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

  /**
   * Verification ID not found error.
   *
   * Thrown when a required verification ID is missing from the user's profile:
   * - User hasn't set up the requested verification method
   * - Verification method was disabled or removed
   * - Invalid verification type requested
   */
  VERIFICATION_ID_NOT_FOUND: {
    status: 404,
    message: "Verification ID not found",
    data: z.object({
      verificationType: z.string().optional(),
    }),
  },

  /**
   * Challenge verification failed error.
   *
   * Thrown when wallet verification challenge fails:
   * - Invalid verification code provided
   * - Verification code expired
   * - Portal service unavailable
   * - Challenge response validation failed
   */
  CHALLENGE_FAILED: {
    status: 401,
    message: "Challenge verification failed",
    data: z.object({
      verificationType: z.string().optional(),
    }),
  },

  /**
   * Operation timeout error.
   *
   * Thrown when an operation exceeds its maximum allowed time:
   * - Block indexing timeout
   * - External service timeout
   * - Database query timeout
   */
  TIMEOUT: {
    status: 504,
    message: "Operation timeout",
    data: z.object({
      details: z.unknown().optional(),
    }),
  },

  /**
   * Transaction failed error.
   *
   * Thrown when a blockchain transaction fails:
   * - Transaction reverted
   * - Insufficient gas
   * - Contract execution error
   * - Invalid transaction parameters
   */
  TRANSACTION_FAILED: {
    status: 400,
    message: "Transaction failed",
    data: z.object({
      details: z.unknown().optional(),
    }),
  },

  /**
   * Transaction confirmation timeout error.
   *
   * Thrown when waiting for transaction confirmation exceeds timeout:
   * - Network congestion
   * - Transaction stuck in mempool
   * - Node synchronization issues
   */
  CONFIRMATION_TIMEOUT: {
    status: 504,
    message: "Transaction confirmation timeout",
    data: z.object({
      details: z.unknown().optional(),
    }),
  },

  /**
   * Authentication missing or failed error.
   *
   * Thrown when a protected procedure is accessed without valid authentication:
   * - Missing authentication tokens
   * - Expired or invalid sessions
   * - Malformed authentication headers
   * - Revoked or blacklisted tokens
   *
   * The OpenAPI security specification indicates that this endpoint requires
   * API key authentication, which will be reflected in generated documentation
   * and client SDKs.
   */
  UNAUTHORIZED: oo.spec(
    {
      message: "Authentication missing or failed",
      status: 401,
    },
    {
      // OpenAPI security requirement for API documentation
      security: [{ apiKey: [] }],
    }
  ),

  /**
   * Onboarding not completed error.
   *
   * Thrown when a procedure is accessed by a user who hasn't completed onboarding:
   * - Missing required profile information
   * - Incomplete KYC/AML verification
   * - Pending document verification
   * - Unaccepted terms and conditions
   *
   * The OpenAPI security specification indicates that this endpoint requires
   * both authentication and completed onboarding, which will be reflected in
   * generated documentation and client SDKs.
   */
  NOT_ONBOARDED: oo.spec(
    {
      message: "User not onboarded",
      status: 403,
    },
    {
      // OpenAPI security requirement for API documentation
      security: [{ apiKey: [] }],
    }
  ),

  /**
   * System not created error.
   *
   * Thrown when the ATK System bootstrap is not completed
   */
  SYSTEM_NOT_CREATED: oo.spec(
    {
      message: "System not created",
      status: 403,
    },
    {
      // OpenAPI security requirement for API documentation
      security: [{ apiKey: [] }],
    }
  ),

  /**
   * Resource not found error.
   *
   * Thrown when a requested resource is not found:
   * - Invalid URL or endpoint
   * - Missing required parameters
   * - Resource not found in database
   */
  NOT_FOUND: {
    message: "Resource not found",
    status: 404,
  },

  /**
   * Resource already exists error.
   *
   * Thrown when a requested resource already exists:
   * - Duplicate resource creation attempt
   * - Resource already exists in database
   */
  RESOURCE_ALREADY_EXISTS: {
    message: "Resource already exists",
    status: 409,
  },

  /**
   * Portal error.
   *
   * Thrown when a portal service error occurs:
   * - Portal service unavailable
   * - Portal service timeout
   * - Portal service error
   */
  PORTAL_ERROR: {
    message: "Portal error",
    status: 500,
    data: z.object({
      operation: z.string(),
      details: z.string(),
    }),
  },
});

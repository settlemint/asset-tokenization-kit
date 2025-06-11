import { oo } from "@orpc/openapi";
import { bc } from "./base.contract";

/**
 * Authenticated ORPC contract for protected procedures.
 *
 * This contract extends the base contract with authentication-specific errors,
 * designed for API procedures that require valid authentication. It adds the
 * UNAUTHORIZED error to the common error set, providing clear feedback when
 * authentication is missing or invalid.
 *
 * The contract includes OpenAPI security specifications to automatically
 * generate proper API documentation with authentication requirements.
 *
 * Use this contract for procedures that require:
 * - Valid user authentication
 * - Active user sessions
 * - API key validation
 * - Protected resource access
 *
 * @see {@link ./base.contract} - Base contract with common errors
 */
export const ac = bc.errors({
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
    },
    {
      // OpenAPI security requirement for API documentation
      security: [{ apiKey: [] }],
    }
  ),
});

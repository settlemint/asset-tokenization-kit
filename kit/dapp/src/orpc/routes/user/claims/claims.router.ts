import { issue } from "@/orpc/routes/user/claims/routes/claims.issue";
import { list } from "@/orpc/routes/user/claims/routes/claims.list";
import { revoke } from "@/orpc/routes/user/claims/routes/claims.revoke";

/**
 * Claims router module.
 *
 * Aggregates all claims-related route handlers into a single exportable object.
 * This module serves as the entry point for the lazy-loaded claims namespace
 * under the user router.
 *
 * Current routes:
 * - list: GET /user/claims/list - Retrieve claims for a specific user
 * - issue: POST /user/claims/issue - Issue a new claim to a user's identity
 * - revoke: POST /user/claims/revoke - Revoke an existing claim from a user's identity
 *
 * The router provides focused claim management operations without the overhead
 * of full user profile data, making it ideal for claims-specific UI components
 * and workflows.
 *
 * **Key Features:**
 * - Lightweight responses focused on claims data
 * - Same authentication/permission model as user routes
 * - Support for all claim types defined in the system
 * - Blockchain integration for claim issuance/revocation
 * - Comprehensive validation and error handling
 *
 * **Authentication & Permissions:**
 * - All routes require authentication
 * - List operation requires "identityManager" or "claimIssuer" roles
 * - Issue/revoke operations require "claimIssuer" role
 * - Identity permissions middleware applies claim filtering
 *
 * @see {@link ./claims.contract} - Type-safe contract definitions
 * @see {@link ./routes/claims.list} - Claims listing implementation
 * @see {@link ./routes/claims.issue} - Claim issuance implementation
 * @see {@link ./routes/claims.revoke} - Claim revocation implementation
 */
const routes = {
  list,
  issue,
  revoke,
};

export default routes;

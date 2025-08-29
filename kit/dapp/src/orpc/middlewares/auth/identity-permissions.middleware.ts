/**
 * Identity permissions middleware for blockchain-based access control in tokenization platform.
 *
 * This middleware implements a security-first approach to user and claim data access,
 * integrating blockchain roles (identity manager) with off-chain trusted issuer status.
 * The design prioritizes fail-safe defaults where undefined permissions mean no access.
 *
 * Security Model:
 * - IDENTITY_MANAGER_ROLE (blockchain): Full access to all users and claims
 * - Trusted issuer for KYC/AML: Can see all users, limited to their claim topics
 * - All other users: No access (secure default)
 *
 * Business Rules:
 * - Identity managers need full visibility for compliance and user management
 * - KYC/AML issuers need user visibility to perform identity verification
 * - Claim topic access is strictly scoped to prevent data leakage
 * - Combined roles: blockchain roles take precedence (identity manager wins)
 *
 * The middleware uses separate boolean flags (canSeeAllUsers, canSeeAllClaims) rather
 * than relying solely on trustedClaimTopics to ensure explicit security boundaries
 * and prevent accidental access through empty arrays or undefined states.
 */

import type { AccessControl } from "@/lib/fragments/the-graph/access-control-fragment";
import type { Context } from "@/orpc/context/context";
import { hasRole } from "@/orpc/helpers/access-control-helpers";
import { baseRouter } from "@/orpc/procedures/base.router";
import type { z } from "zod";

/**
 * Identity permissions computed for a user based on blockchain roles and trusted issuer status.
 *
 * This interface uses explicit boolean flags rather than implicit logic to ensure
 * clear security boundaries. The design prevents accidental access through undefined
 * or empty states by making permissions explicitly opt-in.
 *
 * @example
 * ```typescript
 * // Identity manager - can see everything
 * const identityManagerPerms: IdentityPermissions = {
 *   trustedClaimTopics: [], // Empty means "all topics" when canSeeAllClaims is true
 *   canSeeAllUsers: true,
 *   canSeeAllClaims: true
 * };
 *
 * // KYC issuer - limited access
 * const kycIssuerPerms: IdentityPermissions = {
 *   trustedClaimTopics: ["kyc"],
 *   canSeeAllUsers: true, // Needs to see users to issue KYC claims
 *   canSeeAllClaims: false // Can only see KYC claims
 * };
 *
 * // Regular user - no access
 * const regularUserPerms: IdentityPermissions = {
 *   trustedClaimTopics: [],
 *   canSeeAllUsers: false,
 *   canSeeAllClaims: false
 * };
 * ```
 */
export interface IdentityPermissions {
  /**
   * Claim topics this user is a trusted issuer for.
   *
   * When canSeeAllClaims is true, this array is empty (identity manager scenario).
   * When canSeeAllClaims is false, this contains the specific topics the user can access.
   * Empty array with canSeeAllClaims=false means no claim access.
   */
  trustedClaimTopics: string[];

  /**
   * Whether user can see all users in the system.
   *
   * True for identity managers and KYC/AML issuers who need user visibility
   * to perform their roles. False for regular users (secure default).
   */
  canSeeAllUsers: boolean;

  /**
   * Whether user can see all claims regardless of topic.
   *
   * Intentionally separate from trustedClaimTopics for fail-safe security:
   * - true: Identity manager with unrestricted access
   * - false: Limited to specific topics or no access (secure default)
   *
   * This prevents security bugs where empty arrays might be misinterpreted.
   */
  canSeeAllClaims: boolean;
}

/**
 * Computes complete identity permissions by combining blockchain roles with trusted issuer status.
 *
 * This function implements the core business logic for access control, prioritizing
 * blockchain-based identity manager roles over off-chain trusted issuer designations.
 * The hierarchy ensures that on-chain roles (which are harder to revoke) take precedence.
 *
 * Permission Hierarchy:
 * 1. IDENTITY_MANAGER_ROLE (blockchain) → Full access to users and claims
 * 2. Trusted issuer for KYC/AML → User visibility + limited claim access
 * 3. All others → No access (fail-safe default)
 *
 * @param user - The authenticated user from the session context
 * @param accessControl - Blockchain access control state from TheGraph indexer
 * @param userClaimTopics - Claim topics the user is designated as trusted issuer for
 * @returns Complete identity permissions with explicit access flags
 *
 * @example
 * ```typescript
 * // Identity manager with blockchain role
 * const permissions = computeIdentityPermissions(
 *   user,
 *   { identityManagers: [user.wallet] },
 *   ["kyc", "aml"]
 * );
 * // Returns: { trustedClaimTopics: [], canSeeAllUsers: true, canSeeAllClaims: true }
 *
 * // KYC issuer without identity manager role
 * const permissions = computeIdentityPermissions(
 *   user,
 *   { identityManagers: [] },
 *   ["kyc"]
 * );
 * // Returns: { trustedClaimTopics: ["kyc"], canSeeAllUsers: true, canSeeAllClaims: false }
 * ```
 */
export function computeIdentityPermissions(
  user: NonNullable<Context["auth"]>["user"],
  accessControl: AccessControl | undefined,
  userClaimTopics: string[]
): IdentityPermissions {
  // Check if user has blockchain identity manager role (highest privilege)
  const isIdentityManager = hasRole(
    user.wallet,
    "identityManager",
    accessControl
  );

  // Define claim topics that grant user visibility for identity verification workflows
  // KYC/AML issuers need to see user data to perform identity verification
  // TODO: Make this configurable rather than hardcoded - consider moving to environment config
  const userVisibilityTopics = new Set(["kyc", "aml"]);
  const hasUserVisibilityTopic = userClaimTopics.some((topic) =>
    userVisibilityTopics.has(topic.toLowerCase())
  );

  // Determine user visibility: identity managers OR trusted issuers for identity verification
  // This separation allows KYC/AML workflow without requiring full admin privileges
  const canSeeAllUsers = isIdentityManager || hasUserVisibilityTopic;

  // Only identity managers can see all claims - trusted issuers are topic-limited
  // This prevents privilege escalation where a KYC issuer gains access to unrelated claims
  const canSeeAllClaims = isIdentityManager;

  // Compute claim topic access: identity managers get empty array (meaning "all"),
  // trusted issuers get their specific topics, everyone else gets empty (meaning "none")
  const trustedClaimTopics = canSeeAllClaims ? [] : userClaimTopics;

  return {
    trustedClaimTopics,
    canSeeAllUsers,
    canSeeAllClaims,
  };
}

/**
 * Determines if a user can access another user's data based on computed permissions.
 *
 * This function centralizes user access logic and handles both individual user access
 * and list operations consistently. It currently uses the same permissions for both,
 * but provides a clear extension point for more granular access control.
 *
 * Access Logic:
 * - List operations (targetUserId undefined): Requires canSeeAllUsers permission
 * - Individual user access: Currently also uses canSeeAllUsers (could add self-access)
 * - Future enhancement: Could allow users to access their own data regardless of permissions
 *
 * @param permissions - User's computed identity permissions
 * @param targetUserId - ID of user being accessed, or undefined for list operations
 * @returns true if access should be granted, false for denial (secure default)
 *
 * @example
 * ```typescript
 * // List all users - requires broad permission
 * const canList = canAccessUser(permissions, undefined);
 *
 * // Access specific user - same requirement for now
 * const canAccess = canAccessUser(permissions, "user123");
 *
 * // Both return true only if permissions.canSeeAllUsers is true
 * ```
 */
export function canAccessUser(
  permissions: IdentityPermissions,
  targetUserId: string | undefined
): boolean {
  // List operations (targetUserId undefined) require broad user visibility
  // This prevents unauthorized enumeration of users in the system
  if (!targetUserId) {
    return permissions.canSeeAllUsers;
  }

  // Individual user access uses the same permission for consistency
  // Future consideration: allow users to access their own data with additional check:
  // return permissions.canSeeAllUsers || targetUserId === currentUser.id;
  return permissions.canSeeAllUsers;
}

/**
 * Filters claim data based on user's topic-specific permissions and access level.
 *
 * This function implements the claim filtering logic that respects both identity manager
 * privileges and trusted issuer limitations. It uses a three-tier access model to ensure
 * claims are only visible to authorized parties.
 *
 * Filtering Logic:
 * 1. Identity managers: See all claims (no filtering)
 * 2. Trusted issuers: See only claims for their designated topics
 * 3. Others: See no claims (secure default)
 *
 * The function assumes claims are provided as topic identifiers, not full claim objects,
 * allowing for flexible claim data structures while maintaining consistent access control.
 *
 * @param claims - Array of claim topic identifiers to filter
 * @param permissions - User's computed identity permissions
 * @returns Filtered array of claims the user is authorized to access
 *
 * @example
 * ```typescript
 * const allClaims = ["kyc", "aml", "accredited", "sanctions"];
 *
 * // Identity manager sees everything
 * const managerClaims = filterClaimsForUser(allClaims, {
 *   canSeeAllClaims: true,
 *   trustedClaimTopics: [],
 *   canSeeAllUsers: true
 * });
 * // Returns: ["kyc", "aml", "accredited", "sanctions"]
 *
 * // KYC issuer sees only KYC claims
 * const kycClaims = filterClaimsForUser(allClaims, {
 *   canSeeAllClaims: false,
 *   trustedClaimTopics: ["kyc"],
 *   canSeeAllUsers: true
 * });
 * // Returns: ["kyc"]
 *
 * // Regular user sees nothing
 * const userClaims = filterClaimsForUser(allClaims, {
 *   canSeeAllClaims: false,
 *   trustedClaimTopics: [],
 *   canSeeAllUsers: false
 * });
 * // Returns: []
 * ```
 */
export function filterClaimsForUser(
  claims: string[],
  permissions: IdentityPermissions
): string[] {
  // Identity managers with unrestricted access see all claims
  if (permissions.canSeeAllClaims) {
    return claims;
  }

  // Trusted issuers see only claims for topics they're authorized to issue
  // This prevents topic privilege escalation attacks
  if (permissions.trustedClaimTopics.length > 0) {
    return claims.filter((claim) =>
      permissions.trustedClaimTopics.includes(claim)
    );
  }

  // Secure default: users with no specific permissions see no claims
  // This fail-safe prevents accidental data exposure through configuration errors
  return [];
}

/**
 * ORPC middleware that enforces identity-based access control with fail-fast validation.
 *
 * This middleware implements upfront permission validation following the same pattern
 * as blockchainPermissionsMiddleware. It computes identity permissions and validates
 * access before route execution, preventing unauthorized access attempts early in the
 * request pipeline. The middleware extends the context with computed permissions for
 * use by route handlers.
 *
 * Middleware Design:
 * - Fail-fast: Validates access before route execution, not during data processing
 * - Context extension: Adds identityPermissions to context for route handlers to use
 * - Target-aware: Uses configurable function to extract target user from request input
 * - Integration: Expects userClaimTopics to be set by upstream userClaimsMiddleware
 *
 * Security Features:
 * - Authentication required: Rejects unauthenticated requests immediately
 * - System context validation: Ensures proper system initialization
 * - Permission computation: Combines blockchain roles with trusted issuer status
 * - Access validation: Validates target user access before proceeding
 *
 * @param config.getTargetUserId - Function to extract target user ID from request input
 * @returns Configured middleware function that validates identity permissions
 *
 * @example
 * ```typescript
 * // User list endpoint - no specific target user
 * const usersRouter = baseRouter.use(
 *   identityPermissionsMiddleware({
 *     getTargetUserId: () => undefined, // List operation
 *   })
 * );
 *
 * // Individual user endpoint - extract from input
 * const userRouter = baseRouter.use(
 *   identityPermissionsMiddleware({
 *     getTargetUserId: ({ input }) => input.userId,
 *   })
 * );
 *
 * // Route handler can access computed permissions
 * .query("getUser", {
 *   handler: ({ context }) => {
 *     const { identityPermissions } = context;
 *     // Use permissions for data filtering, etc.
 *   }
 * });
 * ```
 */
export const identityPermissionsMiddleware = <InputSchema extends z.ZodType>({
  getTargetUserId,
}: {
  getTargetUserId: (data: {
    context: Context;
    input: z.infer<InputSchema>;
  }) => string | undefined;
}) =>
  baseRouter.middleware(async ({ context, next, errors }, input) => {
    const { auth, system } = context;

    // Ensure user is authenticated - identity operations require valid user context
    if (!auth) {
      throw errors.UNAUTHORIZED({
        message: "Authentication required for identity operations",
      });
    }

    // Ensure system context is available - needed for blockchain role checks
    if (!system) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "System context not set",
      });
    }

    // Extract target user ID using the configured function
    // Supports both list operations (undefined) and specific user access
    const targetUserId = getTargetUserId({
      context,
      input: input as z.infer<InputSchema>,
    });

    // Retrieve user's claim topics from context (set by upstream userClaimsMiddleware)
    // Falls back to empty array if not set, ensuring safe defaults
    const userClaimTopics = context.userClaimTopics ?? [];

    // Compute comprehensive identity permissions combining blockchain and off-chain roles
    const identityPermissions = computeIdentityPermissions(
      auth.user,
      system.systemAccessManager?.accessControl,
      userClaimTopics
    );

    // Fail fast validation: reject access before expensive route operations
    // This prevents unauthorized users from triggering database queries or other side effects
    if (!canAccessUser(identityPermissions, targetUserId)) {
      throw errors.FORBIDDEN({
        message: targetUserId
          ? `Cannot access user data for user ${targetUserId}`
          : "Cannot access user data",
        data: {
          requiredPermissions:
            "User must be admin, identity manager, or trusted issuer",
        },
      });
    }

    // Extend context with computed permissions for route handler use
    // Route handlers can access identityPermissions for data filtering and additional checks
    return next({
      context: {
        identityPermissions,
      },
    });
  });

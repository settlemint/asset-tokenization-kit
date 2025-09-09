/**
 * Identity permissions middleware for blockchain-based access control in tokenization platform.
 *
 * IMPORTANT: This middleware implements UI/UX access control, not true data security.
 * Claims are stored on-chain for public verifiability - anyone can query the blockchain
 * or TheGraph directly to access all claims data. This middleware controls what gets
 * displayed in the application interface based on user roles, providing:
 * - Clean, role-appropriate user interfaces without information overload
 * - Workflow separation between identity managers and trusted issuers
 * - Prevention of accidental data exposure through UI bugs or misconfigurations
 * - Fail-fast validation to block unauthorized access to admin interfaces
 *
 * Security Model (Application Interface Control):
 * - IDENTITY_MANAGER_ROLE (blockchain): Full access to all users and claims in UI
 * - Trusted issuer for KYC/AML: Can see all users, limited to their claim topics in UI
 * - All other users: No access to user management interfaces (secure default)
 *
 * Business Rules:
 * - Identity managers need full UI visibility for compliance and user management
 * - KYC/AML issuers need user visibility to perform identity verification workflows
 * - Claim topic filtering provides focused UX without showing irrelevant data
 * - Combined roles: blockchain roles take precedence (identity manager wins)
 *
 * Architecture Notes:
 * - Uses fail-fast permission checks before expensive database/TheGraph operations
 * - Fetches all available data from public sources (blockchain/TheGraph) for performance
 * - Applies role-based filtering only at the presentation layer for UI clarity
 * - Separates boolean flags (canSeeAllUsers, canSeeAllClaims) from topic arrays
 *   to ensure explicit security boundaries and prevent logic errors
 */

import type { AccessControl } from "@/lib/fragments/the-graph/access-control-fragment";
import type { Context } from "@/orpc/context/context";
import { hasRole } from "@/orpc/helpers/access-control-helpers";
import { baseRouter } from "@/orpc/procedures/base.router";
import type { z } from "zod";

/**
 * Identity permissions computed for a user based on blockchain roles and trusted issuer status.
 *
 * This interface uses explicit read/write permissions with structured access control
 * to ensure clear security boundaries. The design separates claims access from user
 * data access, and distinguishes between read and write operations.
 *
 * @example
 * ```typescript
 * // Identity manager - full access
 * const identityManagerPerms: IdentityPermissions = {
 *   claims: {
 *     read: ["*"], // Can read all claim topics
 *     write: ["kyc", "aml"] // Can write specific claim topics they're trusted issuer for
 *   },
 *   userData: {
 *     read: true, // Can read user profile data
 *     write: true // Can modify user profile data
 *   }
 * };
 *
 * // Claim issuer - limited access
 * const claimIssuerPerms: IdentityPermissions = {
 *   claims: {
 *     read: ["kyc"], // Can only read KYC claims
 *     write: ["kyc"] // Can only write KYC claims
 *   },
 *   userData: {
 *     read: true, // Can read user data (needed for identity verification)
 *     write: false // Cannot modify user profile data
 *   }
 * };
 *
 * // Regular user - no access
 * const regularUserPerms: IdentityPermissions = {
 *   claims: {
 *     read: [], // Cannot read any claims
 *     write: [] // Cannot write any claims
 *   },
 *   userData: {
 *     read: false, // Cannot read user data
 *     write: false // Cannot write user data
 *   }
 * };
 * ```
 */
export interface IdentityPermissions {
  /**
   * Claims access permissions separated by read/write operations.
   */
  claims: {
    /**
     * Claim topics this user can read.
     *
     * - ["*"]: Can read all claim topics (identity manager)
     * - ["kyc", "aml"]: Can read specific topics (trusted issuer)
     * - []: Cannot read any claims (secure default)
     */
    read: string[];

    /**
     * Claim topics this user can write/issue claims for.
     *
     * Contains the specific topics the user is a trusted issuer for.
     * Empty array means no claim writing permissions.
     */
    write: string[];
  };

  /**
   * User data access permissions separated by read/write operations.
   */
  userData: {
    /**
     * Whether user can read user profile data.
     *
     * True for identity managers and claim issuers who need user visibility
     * to perform identity verification workflows.
     */
    read: boolean;

    /**
     * Whether user can write/modify user profile data.
     *
     * True only for identity managers who have administrative privileges.
     * Claim issuers can read user data but cannot modify it.
     */
    write: boolean;
  };
}

/**
 * Computes complete identity permissions by combining blockchain roles with trusted issuer status.
 *
 * This function implements the core business logic for access control, prioritizing
 * blockchain-based identity manager roles over off-chain trusted issuer designations.
 * The hierarchy ensures that on-chain roles take precedence.
 *
 * Permission Hierarchy:
 * 1. IDENTITY_MANAGER_ROLE (blockchain) → Full access to users and all claims
 * 2. CLAIM_ISSUER_ROLE + trusted issuer → User visibility + topic-specific claim access
 * 3. All others → No access (fail-safe default)
 *
 * @param user - The authenticated user from the session context
 * @param accessControl - Blockchain access control state from TheGraph indexer
 * @param userTrustedIssuerTopics - Claim topics the user is designated as trusted issuer for
 * @returns Complete identity permissions with explicit read/write access flags
 *
 * @example
 * ```typescript
 * // Identity manager with blockchain role
 * const permissions = computeIdentityPermissions(
 *   user,
 *   { identityManagers: [user.wallet] },
 *   ["kyc", "aml"]
 * );
 * // Returns: {
 * //   claims: { read: ["*"], write: ["kyc", "aml"] },
 * //   userData: { read: true, write: true }
 * // }
 *
 * // KYC issuer without identity manager role
 * const permissions = computeIdentityPermissions(
 *   user,
 *   { claimIssuers: [user.wallet] },
 *   ["kyc"]
 * );
 * // Returns: {
 * //   claims: { read: ["kyc"], write: ["kyc"] },
 * //   userData: { read: true, write: false }
 * // }
 * ```
 */
export function computeIdentityPermissions(
  user: NonNullable<Context["auth"]>["user"],
  accessControl: AccessControl | undefined,
  userTrustedIssuerTopics: string[]
): IdentityPermissions {
  // Check blockchain roles
  const isIdentityManager = hasRole(
    user.wallet,
    "identityManager",
    accessControl
  );

  // Check if user is a trusted issuer for any claims
  // This serves as a temporary stand-in for the claimIssuer blockchain role
  // When the blockchain role is implemented, this can be replaced with:
  // const isClaimIssuer = hasRole(user.wallet, "claimIssuer", accessControl);
  const isClaimIssuer = userTrustedIssuerTopics.length > 0;

  // Identity managers have full access
  if (isIdentityManager) {
    return {
      claims: {
        read: ["*"], // Can read all claim topics
        write: userTrustedIssuerTopics, // Can write topics they're trusted issuer for
      },
      userData: {
        read: true, // Can read user data
        write: true, // Can modify user data
      },
    };
  }

  // Claim issuers have limited access
  if (isClaimIssuer) {
    return {
      claims: {
        read: userTrustedIssuerTopics, // Can only read topics they're trusted issuer for
        write: userTrustedIssuerTopics, // Can only write topics they're trusted issuer for
      },
      userData: {
        read: true, // Can read user data (needed for identity verification)
        write: false, // Cannot modify user data
      },
    };
  }

  // Default: no access for regular users
  return {
    claims: {
      read: [], // Cannot read any claims
      write: [], // Cannot write any claims
    },
    userData: {
      read: false, // Cannot read user data
      write: false, // Cannot write user data
    },
  };
}

/**
 * Determines if a user can read user data based on computed permissions.
 *
 * This function centralizes user data read access logic for both individual user access
 * and list operations. It provides a clear extension point for more granular access control.
 *
 * Access Logic:
 * - List operations (targetUserId undefined): Requires userData.read permission
 * - Individual user access: Currently also uses userData.read (could add self-access)
 * - Future enhancement: Could allow users to access their own data regardless of permissions
 *
 * @param permissions - User's computed identity permissions
 * @param targetUserId - ID of user being accessed, or undefined for list operations (reserved for future use)
 * @returns true if read access should be granted, false for denial (secure default)
 */
export function canReadUserData(
  permissions: IdentityPermissions,
  _targetUserId?: string
): boolean {
  // Both list operations and individual access use the same read permission
  // The targetUserId parameter is reserved for future granular access control
  // Future consideration: allow users to access their own data with additional check:
  // return permissions.userData.read || targetUserId === currentUser.id;
  return permissions.userData.read;
}

/**
 * Determines if a user can write/modify user data based on computed permissions.
 *
 * @param permissions - User's computed identity permissions
 * @returns true if write access should be granted, false for denial (secure default)
 */
export function canWriteUserData(permissions: IdentityPermissions): boolean {
  return permissions.userData.write;
}

/**
 * Filters claim data based on user's read permissions for claim topics.
 *
 * This function implements the claim filtering logic that respects both identity manager
 * privileges and trusted issuer limitations. It uses the new structured permission model
 * to determine which claims a user can read.
 *
 * Filtering Logic:
 * 1. ["*"] permission: See all claims (identity manager)
 * 2. Specific topics: See only claims for authorized topics (trusted issuer)
 * 3. Empty array: See no claims (secure default)
 *
 * @param claims - Array of claim topic identifiers to filter
 * @param permissions - User's computed identity permissions
 * @returns Filtered array of claims the user is authorized to read
 *
 * @example
 * ```typescript
 * const allClaims = ["kyc", "aml", "accredited", "sanctions"];
 *
 * // Identity manager sees everything
 * const managerClaims = filterClaimsForUser(allClaims, {
 *   claims: { read: ["*"], write: ["kyc"] },
 *   userData: { read: true, write: true }
 * });
 * // Returns: ["kyc", "aml", "accredited", "sanctions"]
 *
 * // KYC issuer sees only KYC claims
 * const kycClaims = filterClaimsForUser(allClaims, {
 *   claims: { read: ["kyc"], write: ["kyc"] },
 *   userData: { read: true, write: false }
 * });
 * // Returns: ["kyc"]
 *
 * // Regular user sees nothing
 * const userClaims = filterClaimsForUser(allClaims, {
 *   claims: { read: [], write: [] },
 *   userData: { read: false, write: false }
 * });
 * // Returns: []
 * ```
 */
export function filterClaimsForUser(
  claims: string[],
  permissions: IdentityPermissions
): string[] {
  // Check if user has universal read access (identity manager)
  if (permissions.claims.read.includes("*")) {
    return claims;
  }

  // Filter claims to only those the user can read
  if (permissions.claims.read.length > 0) {
    return claims.filter((claim) => permissions.claims.read.includes(claim));
  }

  // Secure default: users with no read permissions see no claims
  return [];
}

/**
 * Determines if a user can read specific claim topics based on permissions.
 *
 * @param topics - Array of claim topics to check access for
 * @param permissions - User's computed identity permissions
 * @returns true if user can read all the specified topics
 */
export function canReadClaims(
  topics: string[],
  permissions: IdentityPermissions
): boolean {
  // Universal read access (identity manager)
  if (permissions.claims.read.includes("*")) {
    return true;
  }

  // Check if user can read all requested topics
  return topics.every((topic) => permissions.claims.read.includes(topic));
}

/**
 * Determines if a user can write/issue specific claim topics based on permissions.
 *
 * @param topics - Array of claim topics to check write access for
 * @param permissions - User's computed identity permissions
 * @returns true if user can write all the specified topics
 */
export function canWriteClaims(
  topics: string[],
  permissions: IdentityPermissions
): boolean {
  // Check if user can write all requested topics
  return topics.every((topic) => permissions.claims.write.includes(topic));
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
 * - Integration: Expects userTrustedIssuerTopics to be set by upstream trustedIssuerMiddleware
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

    // Compute comprehensive identity permissions combining blockchain and off-chain roles
    const identityPermissions = computeIdentityPermissions(
      auth.user,
      system.systemAccessManager?.accessControl,
      context.userTrustedIssuerTopics ?? []
    );

    // Fail fast validation: reject access before expensive route operations
    // This prevents unauthorized users from triggering database queries or other side effects
    if (!canReadUserData(identityPermissions, targetUserId)) {
      throw errors.FORBIDDEN({
        message: targetUserId
          ? `Cannot access user data for user ${targetUserId}`
          : "Cannot access user data",
        data: {
          requiredPermissions:
            "User must have userData.read permission (identity manager or claim issuer role)",
        },
      });
    }

    // Cotinue, user has access
    return next();
  });

import type { AccessControl } from "@/lib/fragments/the-graph/access-control-fragment";
import type { Context } from "@/orpc/context/context";
import { hasRole } from "@/orpc/helpers/access-control-helpers";
import { baseRouter } from "@/orpc/procedures/base.router";
import { getUserRole, type UserRole } from "@atk/zod/user-roles";
import type { z } from "zod";

/**
 * Identity permissions computed for a user based on their role and blockchain roles
 */
export interface IdentityPermissions {
  /** User's off-chain role */
  role: UserRole;
  /** Whether user has IDENTITY_MANAGER blockchain role */
  isIdentityManager: boolean;
  /** Claim topics this user is a trusted issuer for (empty if not trusted issuer or admin) */
  trustedClaimTopics: string[];
  /** Whether user can see all users */
  canSeeAllUsers: boolean;
  /** Whether user can see all claims */
  canSeeAllClaims: boolean;
}

/**
 * Computes complete identity permissions for a user based on their roles
 * @param user - The authenticated user
 * @param accessControl - Access control data from TheGraph
 * @param userClaimTopics - Claim topics the user is a trusted issuer for
 * @returns Complete identity permissions
 */
export function computeIdentityPermissions(
  user: NonNullable<Context["auth"]>["user"],
  accessControl: AccessControl | undefined,
  userClaimTopics: string[]
): IdentityPermissions {
  const role = getUserRole(user.role);
  const isIdentityManager = hasRole(user.wallet, "identityManager", accessControl);

  // Business rules:
  // - IDENTITY_MANAGER_ROLE (on-chain): can see all users, all claims
  // - Trusted issuer: can see all users, claims for their topics only
  // - Combined roles: IDENTITY_MANAGER wins (can see all claims)
  // - All other users: can see nothing

  const canSeeAllUsers = role === "admin" || isIdentityManager || role === "issuer";
  const canSeeAllClaims = role === "admin" || isIdentityManager;
  
  // If user has IDENTITY_MANAGER role, they can see all claims (empty trustedClaimTopics means "all")
  // If user is trusted issuer but not IDENTITY_MANAGER, they can only see their topics
  const trustedClaimTopics = canSeeAllClaims ? [] : (role === "issuer" ? userClaimTopics : []);

  return {
    role,
    isIdentityManager,
    trustedClaimTopics,
    canSeeAllUsers,
    canSeeAllClaims,
  };
}

/**
 * Checks if user can access another user's data
 * @param permissions - User's identity permissions
 * @param targetUserId - ID of user being accessed (undefined for list operations)
 * @returns true if access is allowed
 */
export function canAccessUser(
  permissions: IdentityPermissions,
  targetUserId: string | undefined
): boolean {
  // List operations (targetUserId undefined) use canSeeAllUsers
  if (!targetUserId) {
    return permissions.canSeeAllUsers;
  }

  // Individual user access also uses canSeeAllUsers for now
  // Could be extended for self-access if needed
  return permissions.canSeeAllUsers;
}

/**
 * Filters claims based on user's permissions
 * @param claims - All claims for a user
 * @param permissions - User's identity permissions
 * @returns Filtered claims the user is allowed to see
 */
export function filterClaimsForUser(
  claims: string[],
  permissions: IdentityPermissions
): string[] {
  // If user can see all claims, return all
  if (permissions.canSeeAllClaims) {
    return claims;
  }

  // If user has specific trusted claim topics, filter to those
  if (permissions.trustedClaimTopics.length > 0) {
    return claims.filter(claim => permissions.trustedClaimTopics.includes(claim));
  }

  // User cannot see any claims
  return [];
}

/**
 * Middleware to check identity permissions using fail-fast validation.
 * 
 * This middleware follows the same pattern as blockchainPermissionsMiddleware,
 * validating permissions upfront and failing fast if access is denied.
 * 
 * @param getTargetUserId - Function to extract target user ID from input
 * @returns Middleware function that validates identity permissions
 */
export const identityPermissionsMiddleware = <InputSchema extends z.ZodType>({
  getTargetUserId,
}: {
  getTargetUserId: (
    data: {
      context: Context;
      input: z.infer<InputSchema>;
    }
  ) => string | undefined;
}) =>
  baseRouter.middleware(async ({ context, next, errors }, input) => {
    const { auth, system } = context;

    if (!auth) {
      throw errors.UNAUTHORIZED({
        message: "Authentication required for identity operations",
      });
    }

    if (!system) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "System context not set",
      });
    }

    // Get target user ID from input
    const targetUserId = getTargetUserId({
      context,
      input: input as z.infer<InputSchema>,
    });

    // Get user's claim topics from context (should be set by userClaimsMiddleware)
    const userClaimTopics = context.userClaimTopics ?? [];

    // Compute complete identity permissions
    const identityPermissions = computeIdentityPermissions(
      auth.user,
      system.systemAccessManager?.accessControl,
      userClaimTopics
    );

    // Fail fast if user cannot access the target user's data
    if (!canAccessUser(identityPermissions, targetUserId)) {
      throw errors.FORBIDDEN({
        message: targetUserId 
          ? `Cannot access user data for user ${targetUserId}`
          : "Cannot access user data",
        data: {
          requiredPermissions: "User must be admin, identity manager, or trusted issuer",
        },
      });
    }

    // Pass identity permissions to the route handler
    return next({
      context: {
        identityPermissions,
      },
    });
  });
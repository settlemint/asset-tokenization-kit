/**
 * Authentication Plugin Utilities
 *
 * @remarks
 * This module provides shared utilities for Better Auth plugin implementations
 * in the SettleMint Asset Tokenization Kit. These utilities handle common
 * authentication patterns used across PIN, secret codes, and TOTP plugins.
 *
 * ARCHITECTURAL DESIGN:
 * - Centralized session management to prevent inconsistent auth state
 * - Password validation delegation to Better Auth's internal mechanisms
 * - Onboarding status logic that coordinates multiple authentication methods
 * - Atomic operations to prevent race conditions during session updates
 *
 * WHY SHARED UTILITIES: Authentication plugins share common patterns like
 * session updates, password validation, and onboarding checks. Centralizing
 * these prevents code duplication and ensures consistent behavior.
 *
 * INTEGRATION BOUNDARIES:
 * - Better Auth internal adapter for database operations
 * - Session cookie management for client-side state synchronization
 * - Plugin-specific verification systems (Portal API, ORPC)
 *
 * @see {@link ../pincode-plugin} PIN code authentication implementation
 * @see {@link ../secret-codes-plugin} Backup authentication codes
 * @see {@link ../two-factor} TOTP-based two-factor authentication
 */

import type { SessionUser } from "@/lib/auth";
import type { GenericEndpointContext } from "better-auth";
import { setSessionCookie } from "better-auth/cookies";

/**
 * Updates Better Auth session state with new user properties and refreshes cookies.
 *
 * @remarks
 * WHY ATOMIC SESSION UPDATE: Authentication plugins modify user state
 * (enabled flags, verification IDs) that must stay synchronized with
 * session cookies to prevent auth inconsistencies.
 *
 * WORKFLOW:
 * 1. Guards against missing session (unauthenticated requests)
 * 2. Updates user record in database with new authentication properties
 * 3. Creates fresh session token to invalidate potential security issues
 * 4. Removes old session token to prevent session fixation attacks
 * 5. Sets new session cookie with updated user data
 *
 * SECURITY CONSIDERATIONS:
 * - Session rotation prevents session fixation vulnerabilities
 * - Atomic operation ensures UI and middleware see consistent state
 * - Cookie refresh ensures client-side auth context stays current
 * - Database update happens before session rotation to prevent partial state
 *
 * ERROR HANDLING: If session update fails, old session remains valid
 * and user receives error response without auth state corruption.
 *
 * @param ctx - Better Auth endpoint context with session and database access
 * @param updatedUserFields - Partial user properties to update (e.g., verification flags)
 */
export async function updateSession(
  ctx: GenericEndpointContext,
  updatedUserFields: Partial<SessionUser>
) {
  // GUARD: Early return if no active session to prevent null pointer errors
  // WHY: Only authenticated requests should modify session state
  if (!ctx.context.session) {
    return;
  }

  const user = ctx.context.session.user as SessionUser;

  // STEP 1: Update user properties in database (authentication flags, verification IDs)
  // WHY: Database update must happen first to ensure data consistency
  const updatedUser = await ctx.context.internalAdapter.updateUser(
    user.id,
    updatedUserFields,
    ctx
  );

  // STEP 2: Create new session token with updated user data
  // WHY: Fresh session prevents potential security issues with stale tokens
  const newSession = await ctx.context.internalAdapter.createSession(
    user.id,
    ctx,
    false,
    ctx.context.session.session
  );

  // STEP 3: Remove old session token to prevent parallel session usage
  // SECURITY: Prevents session fixation and ensures only current session is valid
  await ctx.context.internalAdapter.deleteSession(
    ctx.context.session.session.token
  );

  // STEP 4: Update client-side session cookie with new token and user data
  // WHY: Client needs updated cookie to maintain authenticated state
  await setSessionCookie(ctx, {
    session: newSession,
    user: updatedUser,
  });
}

/**
 * Validates user password against stored credential hash using Better Auth's internal mechanisms.
 *
 * @remarks
 * WHY PASSWORD VALIDATION: Many authentication operations (TOTP setup, account changes)
 * require password confirmation to prevent unauthorized modifications to security settings.
 *
 * DELEGATION RATIONALE: Better Auth handles password hashing, salting, and timing-safe
 * comparison. Using internal mechanisms ensures consistency with auth system and
 * prevents cryptographic implementation mistakes.
 *
 * ACCOUNT LOOKUP LOGIC: Users can have multiple authentication providers (OAuth, WebAuthn,
 * credentials). This function specifically looks for credential-based accounts that
 * store password hashes for verification.
 *
 * SECURITY CONSIDERATIONS:
 * - Uses Better Auth's timing-safe password comparison to prevent timing attacks
 * - Returns false for missing accounts to prevent user enumeration
 * - Delegates to proven cryptographic implementations rather than rolling custom logic
 *
 * ERROR HANDLING: Returns false for any failure condition (missing account, no password,
 * invalid password) to provide consistent boolean response for endpoint logic.
 *
 * @param ctx - Better Auth endpoint context with database and password utilities
 * @param data - Password validation parameters
 * @param data.password - Plain text password to verify against stored hash
 * @param data.userId - User ID to look up credential account for
 * @returns True if password matches stored hash, false for any failure condition
 */
export async function validatePassword(
  ctx: GenericEndpointContext,
  data: {
    password: string;
    userId: string;
  }
) {
  // LOOKUP: Find all authentication accounts for user (OAuth, credentials, WebAuthn, etc.)
  // WHY: Users may have multiple authentication methods, need to find credential account
  const accounts = await ctx.context.internalAdapter.findAccounts(data.userId);

  // FILTER: Extract credential-based account that stores password hash
  // WHY: Only credential accounts have password field for verification
  const credentialAccount = accounts.find(
    (account) => account.providerId === "credential"
  );

  const currentPassword = credentialAccount?.password;

  // GUARD: Return false if no credential account or password hash exists
  // SECURITY: Prevents user enumeration by returning false for both cases
  if (!credentialAccount || !currentPassword) {
    return false;
  }

  // VERIFY: Use Better Auth's timing-safe password comparison
  // SECURITY: Delegates to proven cryptographic implementation with timing attack protection
  const compare = await ctx.context.password.verify({
    hash: currentPassword,
    password: data.password,
  });

  return compare;
}

/**
 * Determines if a user has completed the full onboarding process for secure authentication.
 *
 * @remarks
 * ONBOARDING REQUIREMENTS: The Asset Tokenization Kit requires users to set up
 * two types of authentication before accessing sensitive wallet operations:
 *
 * 1. PRIMARY AUTHENTICATION (choose one):
 *    - PIN code authentication (6-digit numeric PIN)
 *    - Two-factor authentication (TOTP with authenticator app)
 *
 * 2. BACKUP AUTHENTICATION (required):
 *    - Secret codes (backup recovery codes for account recovery)
 *    - Must be confirmed as securely stored by user
 *
 * BUSINESS LOGIC RATIONALE:
 * - Primary auth protects day-to-day operations (wallet transactions)
 * - Backup codes prevent permanent account lockout scenarios
 * - Both are required to ensure users have recovery options
 * - Financial applications require robust account recovery mechanisms
 *
 * VERIFICATION COMPLETENESS CHECKS:
 * Each authentication method requires both enablement and verification:
 * - PIN: pincodeEnabled=true AND pincodeVerificationId exists
 * - TOTP: twoFactorEnabled=true AND twoFactorVerificationId exists
 * - Backup: secretCodeVerificationId exists AND secretCodesConfirmed=true
 *
 * SECURITY CONSIDERATIONS:
 * - Users cannot access wallet operations until fully onboarded
 * - Prevents partial security setups that leave accounts vulnerable
 * - Ensures consistent security posture across all user accounts
 * - Reduces support burden from account lockout scenarios
 *
 * @param user - User object with authentication flags and verification IDs
 * @returns True if user has completed onboarding with primary + backup auth
 */
export function isOnboarded(
  user: Pick<
    SessionUser,
    | "pincodeEnabled"
    | "pincodeVerificationId"
    | "twoFactorEnabled"
    | "twoFactorVerificationId"
    | "secretCodeVerificationId"
    | "secretCodesConfirmed"
    | "wallet"
  >
): boolean {
  // PRIMARY AUTHENTICATION: Check if PIN code is fully set up
  // WHY: Both flag and verification ID must exist for complete PIN setup
  const pincodeSet =
    (user.pincodeEnabled && !!user.pincodeVerificationId) ?? false;

  // PRIMARY AUTHENTICATION: Check if TOTP is fully set up
  // WHY: Both flag and verification ID must exist for complete TOTP setup
  const twoFactorSet =
    (user.twoFactorEnabled && !!user.twoFactorVerificationId) ?? false;

  // BACKUP AUTHENTICATION: Check if secret codes are set up and confirmed
  // WHY: Verification ID must exist AND user must confirm secure storage
  const secretCodeSet =
    !!user.secretCodeVerificationId && (user.secretCodesConfirmed ?? false);

  // ONBOARDING LOGIC: Primary authentication (PIN OR TOTP) AND backup codes
  // WHY: Users need one primary method + backup codes for complete security
  const isVerificationSet = (pincodeSet || twoFactorSet) && secretCodeSet;

  return isVerificationSet;
}

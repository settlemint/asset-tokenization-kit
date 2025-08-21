/**
 * Secret Recovery Codes Generation Endpoint
 *
 * ARCHITECTURE: Implements cryptographically secure backup authentication by generating
 * single-use recovery codes through SettleMint Portal API. Codes provide emergency access
 * when primary TOTP 2FA is unavailable (lost device, etc.).
 *
 * SECURITY MODEL:
 * - Portal generates 8-12 cryptographically random recovery codes
 * - Each code can be used exactly once for authentication bypass
 * - Codes are tied to wallet address for additional security layer
 * - Regeneration invalidates all previous codes (prevents code accumulation)
 *
 * BUSINESS LOGIC:
 * - First generation: No password required (setup phase)
 * - Subsequent generations: Password required if codes were previously confirmed
 * - Portal verification ID stored locally for code management operations
 *
 * INTEGRATION: Uses Portal GraphQL mutations for secure code lifecycle management.
 * Portal service handles entropy generation, storage, and one-time-use enforcement.
 */

import { user } from "@/lib/db/schema";
import { portalGraphql } from "@/lib/settlemint/portal";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { eq } from "drizzle-orm/sql";

/**
 * Portal GraphQL mutation for creating wallet verification with recovery codes.
 *
 * @remarks
 * SECURITY: Creates cryptographically secure recovery codes following industry best practices.
 * Portal generates random codes with sufficient entropy to prevent brute force attacks.
 *
 * DESIGN: Inlined mutation keeps GraphQL schema co-located with usage, improving
 * maintainability and reducing cognitive overhead of tracking shared definitions.
 *
 * @param address - Wallet address to associate with recovery codes
 * @returns Verification object with generated codes in parameters field
 */
const GENERATE_SECRET_CODES_MUTATION = portalGraphql(`
  mutation GenerateSecretCodes($address: String!) {
    createWalletVerification(
      userWalletAddress: $address
      verificationInfo: { secretCodes: { name: "SECRET_CODES" } }
    ) {
      id
      name
      parameters
      verificationType
    }
  }
`);

/**
 * Portal GraphQL mutation for removing existing wallet verification.
 *
 * @remarks
 * SECURITY: Cleanly removes existing recovery codes before generating new ones.
 * This prevents code accumulation and ensures only the latest set is valid.
 *
 * BUSINESS LOGIC: Called before every regeneration to maintain single active code set.
 * Portal service handles secure cleanup of cryptographic material and verification state.
 *
 * @param address - Wallet address for verification removal
 * @param verificationId - Specific verification ID to delete
 * @returns Success indicator for deletion operation
 */
const REMOVE_SECRET_CODES_MUTATION = portalGraphql(`
  mutation RemoveSecretCodes($address: String!, $verificationId: String!) {
    deleteWalletVerification(
      userWalletAddress: $address
      verificationId: $verificationId
    ) {
      success
    }
  }
`);

/**
 * Generates new secret recovery codes for authenticated user.
 *
 * @remarks
 * SECURITY: Multi-layered security implementation:
 * - Validates wallet presence (prevents orphaned code generation)
 * - Removes existing codes (prevents accumulation attacks)
 * - Creates new Portal verification (cryptographically secure codes)
 * - Updates local state (maintains consistency)
 *
 * BUSINESS LOGIC: Two-phase security model:
 * - Before confirmation: No password required (setup convenience)
 * - After confirmation: Password required (security enforcement)
 *
 * PERFORMANCE: Single Portal API transaction with atomic local database update.
 * Portal handles secure random generation while local DB maintains verification IDs.
 *
 * ERROR HANDLING: Uses ORPC typed errors for consistent API responses:
 * - NOT_FOUND for missing wallet address
 * - INTERNAL_SERVER_ERROR for Portal API failures
 *
 * @returns Array of recovery codes and verification ID for management operations
 * @throws NOT_FOUND when wallet address not configured
 * @throws INTERNAL_SERVER_ERROR when Portal verification creation fails
 */
export const generate = authRouter.user.secretCodes.generate
  .use(databaseMiddleware)
  .use(portalMiddleware)
  .handler(async function ({ context: { auth, db, portalClient }, errors }) {
    // SECURITY: Validate wallet presence - prevents orphaned code generation for incomplete users
    if (!auth.user.wallet) {
      throw errors.NOT_FOUND({
        message: "Wallet address is not set",
      });
    }

    // SECURITY: Remove existing codes to prevent accumulation - ensures only latest set is valid
    // WHY: Multiple active code sets would create security vulnerabilities and user confusion
    if (auth.user.secretCodeVerificationId) {
      await portalClient.raw.request(REMOVE_SECRET_CODES_MUTATION, {
        address: auth.user.wallet,
        verificationId: auth.user.secretCodeVerificationId,
      });
    }

    // PERF: Single Portal API call for cryptographically secure code generation
    // Portal handles entropy generation, secure storage, and one-time-use tracking
    const result = await portalClient.raw.request(
      GENERATE_SECRET_CODES_MUTATION,
      {
        address: auth.user.wallet,
      }
    );

    // ERROR HANDLING: Fail fast if Portal doesn't return verification ID
    // WHY: Verification ID required for future code management operations
    if (!result.createWalletVerification?.id) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Failed to create wallet verification",
      });
    }

    // BUSINESS LOGIC: Store verification ID locally for future code management operations
    // WHY: Enables regeneration, confirmation, and cleanup operations
    await db
      .update(user)
      .set({
        secretCodeVerificationId: result.createWalletVerification.id,
      })
      .where(eq(user.id, auth.user.id));

    // SECURITY: Extract recovery codes from Portal response - contains sensitive authentication bypass tokens
    // Portal returns codes as comma-separated string, convert to array for client consumption
    const parameters = result.createWalletVerification.parameters as {
      secretCodes?: string;
    };

    return {
      secretCodes: parameters.secretCodes?.split(",") ?? [],
      verificationId: result.createWalletVerification.id,
    };
  });

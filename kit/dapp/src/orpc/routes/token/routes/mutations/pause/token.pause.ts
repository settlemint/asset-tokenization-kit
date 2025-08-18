/**
 * Token Pause Handler for Emergency Operations
 *
 * @fileoverview
 * Implements secure token pausing functionality for emergency situations and maintenance.
 * Pausing halts all token transfers and operations except for administrative functions,
 * providing a critical safety mechanism for asset protection during incidents.
 *
 * @remarks
 * PAUSE SECURITY MODEL:
 * - Only authorized administrators can pause token operations
 * - Pausing is reversible through unpause operations by same authorities
 * - Emergency response mechanism for security incidents or regulatory compliance
 * - Prevents all user-initiated transfers and operations during pause state
 *
 * PAUSABLE EXTENSION REQUIREMENT:
 * - Token contract must implement PAUSABLE extension for pause functionality
 * - Extension validation prevents pause operations on non-pausable tokens
 * - Consistent pause behavior across all token types
 * - Standardized emergency response capabilities
 *
 * USE CASES:
 * - Security incident response (suspected breach or attack)
 * - Regulatory compliance freezing during investigations
 * - Smart contract upgrades and maintenance windows
 * - Emergency stops during market volatility or system issues
 *
 * OPERATIONAL IMPACT:
 * - All transfers become impossible during pause state
 * - Allowances remain valid but cannot be executed
 * - Administrative functions (pause/unpause) remain available
 * - Read operations continue to function normally
 *
 * @see {@link tokenPermissionMiddleware} Permission validation for pause authority
 * @see {@link TOKEN_PERMISSIONS.pause} Required roles for pause operations
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { call } from "@orpc/server";
import { read } from "../../token.read";

/**
 * GraphQL mutation for emergency token pausing.
 *
 * @remarks
 * PAUSABLE INTERFACE: Implements the standard Pausable interface from OpenZeppelin
 * which provides consistent pause/unpause functionality across contracts. The pause
 * state is stored on-chain and affects all token operations.
 *
 * EMERGENCY MECHANICS:
 * - Sets global pause flag in token contract state
 * - All transfer functions check pause state before execution
 * - Administrative functions remain available for recovery operations
 * - Pause state persists until explicitly unpaused by authorized user
 *
 * SECURITY VERIFICATION: Requires wallet verification to prevent unauthorized
 * pausing which could be used as a denial-of-service attack vector.
 *
 * @param address - Token contract address to pause (must implement PAUSABLE extension)
 * @param from - Administrator's wallet address (must have pause permissions)
 * @param challengeId - Portal verification challenge ID (auto-injected by middleware)
 * @param challengeResponse - MFA challenge response (auto-injected by middleware)
 * @returns Object containing transaction hash for monitoring pause operation
 */
const TOKEN_PAUSE_MUTATION = portalGraphql(`
  mutation TokenPause(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
  ) {
    pause: ISMARTPausablePause(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

/**
 * ORPC handler for token pause operations with authorization and extension validation.
 *
 * @remarks
 * AUTHORIZATION REQUIREMENTS: Uses token permission middleware to verify the user
 * has pause authority and the token implements the PAUSABLE extension. This ensures
 * only authorized administrators can trigger emergency stops.
 *
 * EXTENSION VALIDATION: Verifies token contract implements PAUSABLE extension
 * before attempting pause operation. This prevents errors and provides clear
 * feedback when pause functionality is not available.
 *
 * EMERGENCY RESPONSE: Provides immediate token operation halt capability for
 * security incidents, regulatory compliance, or maintenance operations.
 *
 * @param input - Pause parameters including contract address and verification
 * @param context - ORPC context with authenticated user and Portal client
 * @returns Updated token data including new pause state
 * @throws UNAUTHORIZED When user lacks pause permissions on token
 * @throws VALIDATION_ERROR When token doesn't implement PAUSABLE extension
 * @throws PORTAL_ERROR When pause transaction fails or verification is invalid
 */
export const pause = tokenRouter.token.pause
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.pause,
      requiredExtensions: ["PAUSABLE"],
    })
  )
  .handler(async ({ input, context }) => {
    // INPUT EXTRACTION: Destructure pause parameters from validated input
    // WHY: Type-safe extraction ensures all required parameters are present
    // Portal middleware will validate wallet verification parameters
    const { contract, walletVerification } = input;
    const { auth } = context;

    // AUTHENTICATED ADMINISTRATOR: Extract user information for pause authorization
    // WHY: Only authorized administrators should be able to pause token operations
    // Permission middleware validates pause authority before execution
    const sender = auth.user;
    // EMERGENCY PAUSE EXECUTION: Submit pause transaction with verification
    // WHY: Portal client handles transaction tracking and verification automatically
    // Pause operation halts all token transfers until explicitly unpaused
    await context.portalClient.mutate(
      TOKEN_PAUSE_MUTATION,
      {
        address: contract,
        from: sender.wallet,
      },
      {
        sender,
        code: walletVerification.secretVerificationCode,
        type: walletVerification.verificationType,
      }
    );

    // UPDATED TOKEN STATE: Return fresh token information including pause status
    // WHY: Client needs updated pause state for UI display and operation validation
    // Portal middleware ensures transaction is confirmed and indexed before data refresh
    return await call(
      read,
      {
        tokenAddress: contract,
      },
      {
        context,
      }
    );
  });

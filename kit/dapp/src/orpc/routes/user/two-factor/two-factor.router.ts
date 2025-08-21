/**
 * Two-Factor Authentication (TOTP) Router
 *
 * ARCHITECTURE: Implements Time-based One-Time Password (TOTP) authentication following
 * RFC 6238 standard. Provides primary security layer beyond password authentication
 * using cryptographically secure time-synchronized codes.
 *
 * SECURITY MODEL:
 * - Enable: Creates Portal verification with secure TOTP parameters and QR code URI
 * - Verify: Validates OTP codes and enables 2FA on first successful verification
 * - Disable: Removes Portal verification and clears local 2FA state
 *
 * BUSINESS LOGIC:
 * - Two-phase enablement: Setup → Verification → Activation
 * - Auto-activation on first successful OTP to prevent incomplete states
 * - Cleanup operations maintain consistency between Portal and local database
 *
 * INTEGRATION: Uses Portal GraphQL API for cryptographic operations:
 * - TOTP secret generation with proper entropy
 * - Code validation with replay attack protection
 * - Secure verification state management
 *
 * DESIGN RATIONALE: Inlined Portal mutations improve error handling and code locality
 * compared to shared query functions. Each endpoint handles specific authentication phase.
 */

import { enable } from "./two-factor.enable";
import { disable } from "./two-factor.disable";
import { verify } from "./two-factor.verify";

/**
 * Two-factor authentication route handlers.
 *
 * @remarks
 * ARCHITECTURE: Three-endpoint design covers complete TOTP lifecycle:
 * - enable: Initialize 2FA with QR code generation
 * - verify: Validate codes and complete activation
 * - disable: Remove 2FA and cleanup state
 *
 * SECURITY: Each endpoint validates prerequisites and maintains secure state transitions.
 */
const routes = {
  enable,
  disable,
  verify,
};

export default routes;
export { routes as twoFactorRouter };

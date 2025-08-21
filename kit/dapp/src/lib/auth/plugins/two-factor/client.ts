/**
 * Better Auth Client Plugin for Two-Factor Authentication (TOTP)
 *
 * @remarks
 * This client-side companion to the TOTP server plugin enables type-safe
 * two-factor authentication operations in React components. It provides
 * automatic session synchronization when TOTP operations complete.
 *
 * ARCHITECTURAL DESIGN:
 * - Type inference from server plugin ensures client/server contract consistency
 * - Atom listeners automatically refresh session state after TOTP operations
 * - Session signal ensures UI components reflect current two-factor status
 * - Client plugin pattern maintains Better Auth's type safety guarantees
 *
 * SESSION SYNCHRONIZATION SCENARIOS:
 * When users perform TOTP operations, session state needs updates:
 * - After enable: `twoFactorVerificationId` set, `twoFactorEnabled` stays false
 * - After first verify: `twoFactorEnabled` becomes true (completes setup)
 * - After disable: Both fields cleared to remove TOTP protection
 * - UI components immediately reflect TOTP availability and requirements
 *
 * SECURITY UI INTEGRATION: UI components check `twoFactorEnabled` flag
 * to show/hide TOTP-protected operations. The atom listener ensures this
 * flag updates immediately after verification without manual refresh.
 *
 * ONBOARDING FLOW SUPPORT: The automatic session refresh enables smooth
 * TOTP setup flows where users see immediate feedback after each step
 * (QR code generation, first verification, etc.).
 *
 * @see {@link ./index} Server-side two-factor plugin implementation
 * @see {@link https://better-auth.com/docs/concepts/plugins#client-plugins} Better Auth client plugin documentation
 */

import type { BetterAuthClientPlugin } from "better-auth/types";
import type { twoFactor } from "./index";

/**
 * Creates the client-side two-factor authentication plugin for Better Auth.
 *
 * @remarks
 * This plugin configures automatic session refresh behavior for TOTP
 * operations, ensuring React components receive updated authentication
 * state immediately after two-factor changes.
 *
 * AUTOMATIC SESSION REFRESH: The atom listener monitors requests to
 * `/two-factor/*` endpoints and triggers `$sessionSignal` when operations
 * complete. This causes:
 * - `useSession()` hooks to re-render with updated user data
 * - Security UI components to show/hide TOTP-protected features
 * - Authentication guards to re-evaluate with current TOTP state
 * - Onboarding flows to progress automatically after TOTP verification
 *
 * PATH MATCHING COVERAGE: Uses prefix matching to catch all TOTP
 * endpoints rather than exact matches, providing coverage for:
 * - /two-factor/enable (TOTP setup initiation)
 * - /two-factor/verify-totp (code verification for setup/auth)
 * - /two-factor/disable (TOTP removal)
 * - Future TOTP endpoints added to the plugin
 *
 * TOTP WORKFLOW INTEGRATION: The session refresh is critical for multi-step
 * TOTP setup where users need immediate feedback after each verification
 * attempt, especially during the initial setup completion.
 *
 * @returns Better Auth client plugin configuration with session sync behavior
 */
export const twoFactorClient = () => {
  return {
    id: "two-factor", // WHY: Must match server plugin ID for Better Auth plugin pairing
    // TYPE INFERENCE: Links client plugin to server plugin for type safety
    // WHY: Ensures client code gets proper TypeScript types for all TOTP endpoints
    $InferServerPlugin: {} as ReturnType<typeof twoFactor>,
    atomListeners: [
      {
        // SESSION SYNC: Monitor all two-factor endpoints for completion
        // WHY: TOTP operations modify session fields that security components depend on
        matcher: (path) => path.startsWith("/two-factor/"),
        // SIGNAL: Trigger session refresh to update client-side auth state
        // WHY: Ensures React components re-render with updated twoFactorEnabled flag
        signal: "$sessionSignal",
      },
    ],
  } satisfies BetterAuthClientPlugin;
};

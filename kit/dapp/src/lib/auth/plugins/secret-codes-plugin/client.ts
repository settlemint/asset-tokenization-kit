/**
 * Better Auth Client Plugin for Secret Code Authentication
 *
 * @remarks
 * This client-side companion to the secret codes server plugin enables
 * type-safe backup authentication operations in React components. It provides
 * automatic session synchronization when secret code operations complete.
 *
 * ARCHITECTURAL DESIGN:
 * - Type inference from server plugin ensures client/server contract consistency
 * - Atom listeners automatically refresh session state after code operations
 * - Session signal ensures UI components reflect current backup code status
 * - Client plugin pattern maintains Better Auth's type safety guarantees
 *
 * SESSION SYNCHRONIZATION SCENARIOS:
 * When users perform secret code operations, the session state needs updates:
 * - After generation: `secretCodeVerificationId` is set for Portal linkage
 * - After confirmation: `secretCodesConfirmed` enables recovery UI components
 * - UI components immediately reflect new backup code availability
 *
 * RECOVERY FLOW INTEGRATION: UI components check `secretCodesConfirmed` flag
 * to show/hide recovery options. The atom listener ensures this flag updates
 * immediately after confirmation without requiring manual page refresh.
 *
 * @see {@link ./index} Server-side secret codes plugin implementation
 * @see {@link https://better-auth.com/docs/concepts/plugins#client-plugins} Better Auth client plugin documentation
 */

import type { BetterAuthClientPlugin } from "better-auth/types";
import type { secretCodes } from "./index";

/**
 * Creates the client-side secret codes authentication plugin for Better Auth.
 *
 * @remarks
 * This plugin configures automatic session refresh behavior for backup
 * authentication code operations, ensuring React components receive updated
 * authentication state immediately after secret code changes.
 *
 * AUTOMATIC SESSION REFRESH: The atom listener monitors requests to
 * `/secret-codes/*` endpoints and triggers `$sessionSignal` when operations
 * complete. This causes:
 * - `useSession()` hooks to re-render with updated user data
 * - Recovery UI components to show/hide based on confirmation status
 * - Authentication guards to re-evaluate with current backup code state
 * - Onboarding flows to reflect completed backup code setup
 *
 * PATH MATCHING COVERAGE: Uses prefix matching to catch all secret code
 * endpoints rather than exact matches, providing coverage for:
 * - /secret-codes/generate (backup code creation)
 * - /secret-codes/confirm (user storage confirmation)
 * - Future secret code endpoints added to the plugin
 *
 * @returns Better Auth client plugin configuration with session sync behavior
 */
export const secretCodesClient = () => {
  return {
    id: "secret-codes", // WHY: Must match server plugin ID for Better Auth plugin pairing
    // TYPE INFERENCE: Links client plugin to server plugin for type safety
    // WHY: Ensures client code gets proper TypeScript types for all secret code endpoints
    $InferServerPlugin: {} as ReturnType<typeof secretCodes>,
    atomListeners: [
      {
        // SESSION SYNC: Monitor all secret code endpoints for completion
        // WHY: Secret code operations modify session fields that UI components depend on
        matcher: (path) => path.startsWith("/secret-codes/"),
        // SIGNAL: Trigger session refresh to update client-side auth state
        // WHY: Ensures React components re-render with updated secretCodesConfirmed flag
        signal: "$sessionSignal",
      },
    ],
  } satisfies BetterAuthClientPlugin;
};

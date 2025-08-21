/**
 * Better Auth Client Plugin for PIN Code Authentication
 *
 * @remarks
 * This client-side companion to the PIN code server plugin enables type-safe
 * PIN code operations in React components and client-side code. It provides
 * automatic session synchronization when PIN operations complete.
 *
 * ARCHITECTURAL DESIGN:
 * - Type inference from server plugin ensures client/server contract consistency
 * - Atom listeners automatically refresh session state after PIN operations
 * - Session signal ensures UI components re-render with updated auth state
 * - Client plugin pattern maintains Better Auth's type safety guarantees
 *
 * SESSION SYNCHRONIZATION:
 * When users perform PIN operations (enable, disable, update), the session
 * state needs to be updated in the client to reflect changes like
 * `pincodeEnabled` flag and `pincodeVerificationId`. The atom listeners
 * automatically trigger session refresh for PIN endpoints.
 *
 * TYPE SAFETY: The `$InferServerPlugin` mechanism creates a type relationship
 * between client and server plugin, ensuring that any changes to server
 * endpoints are automatically reflected in TypeScript types for client usage.
 *
 * @see {@link ./index} Server-side PIN code plugin implementation
 * @see {@link https://better-auth.com/docs/concepts/plugins#client-plugins} Better Auth client plugin documentation
 */

import type { BetterAuthClientPlugin } from "better-auth/types";
import type { pincode } from "./index";

/**
 * Creates the client-side PIN code authentication plugin for Better Auth.
 *
 * @remarks
 * This plugin configures automatic session refresh behavior for PIN code
 * operations, ensuring that React components receive updated authentication
 * state immediately after PIN changes.
 *
 * AUTOMATIC SESSION REFRESH: The atom listener pattern monitors all requests
 * to `/pincode/*` endpoints and triggers the `$sessionSignal` when operations
 * complete. This causes:
 * - `useSession()` hooks to re-render with updated user data
 * - Authentication guards to re-evaluate with current state
 * - UI components to show/hide PIN-related features correctly
 *
 * PATH MATCHING: Uses prefix matching (`startsWith`) to catch all PIN
 * endpoints rather than exact matches, providing coverage for:
 * - /pincode/enable (PIN creation)
 * - /pincode/disable (PIN removal)
 * - /pincode/update (PIN changes)
 * - Future PIN endpoints added to the plugin
 *
 * @returns Better Auth client plugin configuration with session sync behavior
 */
export const pincodeClient = () => {
  return {
    id: "pincode", // WHY: Must match server plugin ID for Better Auth plugin pairing
    // TYPE INFERENCE: Links client plugin to server plugin for type safety
    // WHY: Ensures client code gets proper TypeScript types for all PIN endpoints
    $InferServerPlugin: {} as ReturnType<typeof pincode>,
    atomListeners: [
      {
        // SESSION SYNC: Monitor all PIN-related endpoints for completion
        // WHY: PIN operations modify user session fields that UI components depend on
        matcher: (path) => path.startsWith("/pincode/"),
        // SIGNAL: Trigger session refresh to update client-side auth state
        // WHY: Ensures React components re-render with updated pincodeEnabled/pincodeVerificationId
        signal: "$sessionSignal",
      },
    ],
  } satisfies BetterAuthClientPlugin;
};

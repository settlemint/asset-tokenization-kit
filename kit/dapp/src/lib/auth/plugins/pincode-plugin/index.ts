/**
 * Better Auth Plugin for PIN Code Authentication
 *
 * @remarks
 * This plugin extends Better Auth with PIN code functionality for wallet security.
 * It implements a dual-layer architecture where Better Auth manages session state
 * while ORPC handles the cryptographic verification logic.
 *
 * ARCHITECTURAL DECISIONS:
 * - Better Auth plugin pattern for seamless integration with existing auth flow
 * - ORPC delegation for PIN verification to leverage existing security infrastructure
 * - Session state synchronization to keep auth context consistent across requests
 * - Rate limiting to prevent brute force attacks on PIN endpoints
 *
 * SECURITY BOUNDARIES:
 * - PIN validation occurs in ORPC layer with proper hashing and salt
 * - Session updates are atomic to prevent inconsistent auth state
 * - Verification IDs are unique per user to prevent cross-user attacks
 * - Rate limiting applies to all PIN endpoints (3 attempts per 10-second window)
 *
 * @see {@link ../../../orpc/routes/user/pincode} ORPC PIN verification implementation
 * @see {@link ./client} Client-side PIN code utilities
 */

import { updateSession } from "@/lib/auth/plugins/utils";
import { remove } from "@/orpc/routes/user/pincode/pincode.remove";
import { set } from "@/orpc/routes/user/pincode/pincode.set";
import { update } from "@/orpc/routes/user/pincode/pincode.update";
import { pincode as pincodeValidator } from "@atk/zod/pincode";
import { call } from "@orpc/server";
import type { BetterAuthPlugin } from "better-auth";
import {
  APIError,
  createAuthEndpoint,
  sessionMiddleware,
} from "better-auth/api";
import { z } from "zod";

/**
 * Creates a Better Auth plugin for PIN code authentication functionality.
 *
 * @remarks
 * WHY PLUGIN ARCHITECTURE: Better Auth plugins provide a clean way to extend
 * authentication with custom fields and endpoints while maintaining type safety
 * and session consistency across the application.
 *
 * SCHEMA DESIGN: The plugin adds two fields to the user schema:
 * - pincodeEnabled: Boolean flag for UI state management and feature gating
 * - pincodeVerificationId: Unique identifier linking user to Portal verification system
 *
 * ENDPOINT PATTERN: All endpoints follow the same pattern:
 * 1. Validate input with Zod schemas
 * 2. Delegate to ORPC for business logic and cryptographic operations
 * 3. Update Better Auth session state to reflect changes
 * 4. Return success response or throw APIError with context
 *
 * @returns Better Auth plugin configuration with PIN code endpoints and schema
 */
export const pincode = () => {
  return {
    id: "pincode",
    schema: {
      user: {
        fields: {
          // WHY: Boolean flag enables UI components to conditionally show PIN-related features
          // and allows middleware to determine if PIN verification is required for operations
          pincodeEnabled: {
            type: "boolean",
            defaultValue: false,
            required: false,
            input: false, // SECURITY: Prevent direct manipulation via registration/update APIs
            returned: true, // UI needs this for conditional rendering
          },
          // WHY: Links user to Portal's verification system for cryptographic challenge-response
          // Unique constraint prevents verification ID reuse across different users
          pincodeVerificationId: {
            type: "string",
            required: false,
            unique: true, // SECURITY: Ensures one-to-one mapping between users and verification IDs
            input: false, // SECURITY: Only set internally, never from user input
            returned: true, // Middleware needs this for Portal verification calls
          },
        },
      },
    },
    endpoints: {
      /**
       * Endpoint to enable PIN code authentication for a user account.
       *
       * @remarks
       * WORKFLOW: This endpoint creates a new PIN code for the authenticated user:
       * 1. Validates PIN format using Zod schema (6 digits, numeric only)
       * 2. Delegates to ORPC for cryptographic hashing and Portal registration
       * 3. Updates Better Auth session with verification ID and enabled flag
       * 4. Returns success status for UI feedback
       *
       * SECURITY CONSIDERATIONS:
       * - PIN is validated for format before processing (prevents malformed input)
       * - ORPC handles salting and hashing (prevents plaintext storage)
       * - Session update is atomic (prevents inconsistent auth state)
       * - Rate limiting prevents brute force attempts
       *
       * ERROR HANDLING: If ORPC call fails, session state remains unchanged
       * and user receives clear error message without exposing internal details.
       */
      enablePincode: createAuthEndpoint(
        "/pincode/enable",
        {
          method: "POST",
          body: z.object({
            pincode: pincodeValidator, // WHY: Ensures 6-digit numeric format before processing
          }),
          use: [sessionMiddleware], // WHY: Requires active session to prevent unauthorized PIN setting
          metadata: {
            openapi: {
              summary: "Set and enable pincode",
              description:
                "Use this endpoint to enable pincode. This will set the pincode for the user's account.",
              responses: {
                200: {
                  description: "Successful response",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          success: {
                            type: "boolean",
                            description: "Success status",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        async (ctx) => {
          try {
            // DELEGATION: ORPC handles PIN hashing, salting, and Portal verification ID creation
            // WHY: Centralizes cryptographic operations and maintains security boundaries
            const { success, verificationId } = await call(set, ctx.body, {
              context: {
                headers: Object.fromEntries(ctx.headers?.entries() ?? []),
              },
            });

            if (success) {
              // ATOMIC UPDATE: Both fields updated together to prevent inconsistent state
              // WHY: UI and middleware depend on these fields being synchronized
              await updateSession(ctx, {
                pincodeEnabled: true, // UI feature flag
                pincodeVerificationId: verificationId, // Portal verification link
              });
            }
          } catch (error) {
            // ERROR BOUNDARY: Convert ORPC errors to Better Auth APIError format
            // WHY: Maintains consistent error handling across authentication endpoints
            throw new APIError("INTERNAL_SERVER_ERROR", {
              message:
                error instanceof Error
                  ? error.message
                  : "Pincode could not be set",
              errorWithStack: error,
            });
          }
          return ctx.json({ success: true });
        }
      ),
      /**
       * Endpoint to disable PIN code authentication for a user account.
       *
       * @remarks
       * WORKFLOW: This endpoint removes PIN code authentication:
       * 1. Delegates to ORPC to remove PIN from Portal verification system
       * 2. Clears Better Auth session fields (enabled flag and verification ID)
       * 3. Returns success status for UI state updates
       *
       * SECURITY IMPLICATIONS:
       * - Removes PIN from Portal's verification system (prevents future use)
       * - Clears verification ID to break link between user and Portal
       * - Session update is atomic to prevent partial disable state
       * - User must re-enable PIN to use PIN-protected operations
       *
       * USE CASE: User wants to switch to different authentication method
       * or temporarily disable PIN-based wallet verification.
       */
      disablePincode: createAuthEndpoint(
        "/pincode/disable",
        {
          method: "DELETE", // WHY: DELETE semantics match the removal operation
          use: [sessionMiddleware], // WHY: Requires active session to prevent unauthorized PIN removal
          metadata: {
            openapi: {
              summary: "Disable pincode",
              description:
                "Use this endpoint to disable pincode. This will remove the pincode from the user's account.",
              responses: {
                200: {
                  description: "Successful response",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          success: {
                            type: "boolean",
                            description: "Success status",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        async (ctx) => {
          try {
            // DELEGATION: ORPC handles PIN removal from Portal verification system
            // WHY: Ensures PIN is properly removed from cryptographic storage
            const { success } = await call(remove, ctx.body, {
              context: {
                headers: Object.fromEntries(ctx.headers?.entries() ?? []),
              },
            });

            if (success) {
              // CLEANUP: Clear both session fields to fully disable PIN functionality
              // WHY: UI components check pincodeEnabled, middleware checks pincodeVerificationId
              await updateSession(ctx, {
                pincodeEnabled: false, // UI feature flag
                pincodeVerificationId: null, // Break Portal verification link
              });
            }
          } catch (error) {
            // ERROR BOUNDARY: Convert ORPC errors to Better Auth APIError format
            throw new APIError("INTERNAL_SERVER_ERROR", {
              message:
                error instanceof Error
                  ? error.message
                  : "Pincode could not be disabled",
              errorWithStack: error,
            });
          }
          return ctx.json({ success: true });
        }
      ),
      /**
       * Endpoint to update an existing PIN code for a user account.
       *
       * @remarks
       * WORKFLOW: This endpoint changes an existing PIN code:
       * 1. Validates new PIN format using Zod schema
       * 2. Delegates to ORPC for cryptographic update in Portal system
       * 3. Updates Better Auth session with new verification ID
       * 4. Maintains enabled state (PIN remains active)
       *
       * SECURITY CONSIDERATIONS:
       * - New PIN gets fresh cryptographic salt and hash
       * - New verification ID prevents replay attacks with old PIN
       * - Session update is atomic to prevent inconsistent state
       * - Rate limiting prevents brute force PIN changes
       *
       * DESIGN DECISION: Update generates new verification ID rather than
       * reusing existing one to ensure cryptographic freshness and prevent
       * potential security issues with PIN reuse patterns.
       */
      updatePincode: createAuthEndpoint(
        "/pincode/update",
        {
          method: "PATCH", // WHY: PATCH semantics for partial resource update (PIN only)
          body: z.object({
            newPincode: pincodeValidator, // WHY: Ensures new PIN meets format requirements
          }),
          use: [sessionMiddleware], // WHY: Requires active session to prevent unauthorized PIN updates
          metadata: {
            openapi: {
              summary: "Update pincode",
              description:
                "Use this endpoint to update pincode. This will update the pincode for the user's account.",
              responses: {
                200: {
                  description: "Successful response",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          success: {
                            type: "boolean",
                            description: "Success status",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        async (ctx) => {
          try {
            // DELEGATION: ORPC handles PIN update with fresh cryptographic parameters
            // WHY: Ensures new PIN gets proper salting and generates new verification ID
            const { success, verificationId } = await call(
              update,
              {
                pincode: ctx.body.newPincode,
              },
              {
                context: {
                  headers: Object.fromEntries(ctx.headers?.entries() ?? []),
                },
              }
            );

            if (success) {
              // UPDATE: New verification ID ensures cryptographic freshness
              // WHY: Prevents security issues from PIN reuse and ensures Portal link is current
              await updateSession(ctx, {
                pincodeEnabled: true, // Maintain enabled state
                pincodeVerificationId: verificationId, // Fresh Portal verification link
              });
            }
          } catch (error) {
            // ERROR BOUNDARY: Convert ORPC errors to Better Auth APIError format
            throw new APIError("INTERNAL_SERVER_ERROR", {
              message:
                error instanceof Error
                  ? error.message
                  : "Pincode could not be updated",
              errorWithStack: error,
            });
          }
          return ctx.json({ success: true });
        }
      ),
    },
    /**
     * Rate limiting configuration for PIN code endpoints.
     *
     * @remarks
     * SECURITY: Prevents brute force attacks on PIN operations by limiting
     * attempts to 3 per 10-second window across all PIN endpoints.
     *
     * RATIONALE: PIN codes are sensitive authentication factors that require
     * protection against automated attacks. The 3/10s limit balances security
     * with legitimate user experience (allows for typos and corrections).
     *
     * SCOPE: Applies to all endpoints starting with "/pincode" including:
     * - /pincode/enable (PIN creation)
     * - /pincode/disable (PIN removal)
     * - /pincode/update (PIN changes)
     */
    rateLimit: [
      {
        pathMatcher(path) {
          return path.startsWith("/pincode"); // WHY: Covers all PIN-related endpoints
        },
        window: 10, // SECURITY: 10-second window prevents rapid-fire attacks
        max: 3, // SECURITY: 3 attempts allows for user error while blocking brute force
      },
    ],
  } satisfies BetterAuthPlugin;
};

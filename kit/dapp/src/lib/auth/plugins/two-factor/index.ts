import { orpc } from "@/orpc/orpc-client";
import type { BetterAuthPlugin } from "better-auth";
import {
  APIError,
  createAuthEndpoint,
  sessionMiddleware,
} from "better-auth/api";
import { z } from "zod";

export const twoFactor = () => {
  return {
    id: "two-factor",
    schema: {
      user: {
        fields: {
          twoFactorEnabled: {
            type: "boolean",
            defaultValue: false,
            required: false,
            input: false, // SECURITY: Prevent direct manipulation via registration/update APIs
            returned: true, // UI needs this for conditional rendering
          },
          twoFactorVerificationId: {
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
      enableTwoFactor: createAuthEndpoint(
        "/two-factor/enable",
        {
          method: "POST",
          body: z.object({}),
          use: [sessionMiddleware],
          metadata: {
            openapi: {
              summary: "Enable two factor authentication",
              description:
                "Use this endpoint to enable two factor authentication. This will generate a TOTP URI. Once the user verifies the TOTP URI, the two factor authentication will be enabled.",
              responses: {
                200: {
                  description: "Successful response",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          totpURI: {
                            type: "string",
                            description: "TOTP URI",
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
            // Delegate to ORPC for TOTP setup with Portal
            const { totpURI } = await orpc.user.twoFactor.enable.call({});

            // Note: The ORPC route already updates the database with the verification ID
            // and sets twoFactorEnabled to false initially (will be set to true on first verify)
            // We just need to return the TOTP URI for the client

            return await ctx.json({ totpURI });
          } catch (error) {
            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: "Failed to enable two-factor authentication",
              cause: error,
            });
          }
        }
      ),
      disableTwoFactor: createAuthEndpoint(
        "/two-factor/disable",
        {
          method: "POST",
          body: z.object({}),
          use: [sessionMiddleware],
          metadata: {
            openapi: {
              summary: "Disable two factor authentication",
              description:
                "Use this endpoint to disable two factor authentication.",
              responses: {
                200: {
                  description: "Successful response",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          status: {
                            type: "boolean",
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
            // Delegate to ORPC for TOTP removal from Portal
            const { status } = await orpc.user.twoFactor.disable.call({});

            // Note: The ORPC route already updates the database to clear
            // twoFactorEnabled and twoFactorVerificationId

            return await ctx.json({ status });
          } catch (error) {
            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: "Failed to disable two-factor authentication",
              cause: error,
            });
          }
        }
      ),
      verifyTOTP: createAuthEndpoint(
        "/two-factor/verify-totp",
        {
          method: "POST",
          body: z.object({
            code: z.string().describe("The otp code to verify"),
          }),
          use: [sessionMiddleware],
          metadata: {
            openapi: {
              summary: "Verify two factor TOTP",
              description: "Verify two factor TOTP",
              responses: {
                200: {
                  description: "Successful response",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          status: {
                            type: "boolean",
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
          const { code } = ctx.body;

          try {
            // Delegate to ORPC for TOTP verification with Portal
            const { status } = await orpc.user.twoFactor.verify.call({ code });

            // Note: The ORPC route already updates the database to set
            // twoFactorEnabled to true on first successful verification

            return await ctx.json({ status });
          } catch (error) {
            // Check if it's an UNAUTHORIZED error from ORPC
            if (
              error &&
              typeof error === "object" &&
              "status" in error &&
              error.status === 401
            ) {
              throw new APIError("UNAUTHORIZED", {
                message: "Invalid two factor code",
              });
            }
            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: "Failed to verify two-factor code",
              cause: error,
            });
          }
        }
      ),
    },
    /**
     * Rate limiting configuration for two-factor authentication endpoints.
     *
     * @remarks
     * SECURITY: Prevents brute force attacks on TOTP verification endpoints.
     * TOTP codes are time-sensitive (30-second windows) but still require
     * protection against automated guessing attacks.
     *
     * RATIONALE: The 3/10s limit balances security with legitimate use:
     * - Prevents automated brute force attacks on 6-digit TOTP codes
     * - Allows for user errors (wrong code, timing issues)
     * - Covers setup, verification, and disable operations
     * - Accommodates clock synchronization issues between devices
     *
     * ATTACK VECTORS MITIGATED:
     * - Automated TOTP code guessing (1 in 1,000,000 chance per attempt)
     * - Rapid verification attempts to exploit time window overlaps
     * - Resource exhaustion attacks on Portal API verification calls
     * - Setup/disable endpoint abuse
     *
     * TIME WINDOW CONSIDERATIONS: TOTP codes change every 30 seconds,
     * so rate limiting complements the natural time-based protection.
     */
    rateLimit: [
      {
        pathMatcher(path) {
          return path.startsWith("/two-factor/"); // WHY: Covers all TOTP endpoints
        },
        window: 10, // SECURITY: 10-second window prevents rapid-fire attacks
        max: 3, // SECURITY: 3 attempts allows for user/clock errors while blocking automation
      },
    ],
  } satisfies BetterAuthPlugin;
};

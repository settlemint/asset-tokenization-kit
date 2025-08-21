import { updateSession } from "@/lib/auth/plugins/utils";
import { orpc } from "@/orpc/orpc-client";
import type { BetterAuthPlugin } from "better-auth";
import {
  APIError,
  createAuthEndpoint,
  sessionMiddleware,
} from "better-auth/api";
import { z } from "zod";

export const secretCodes = () => {
  return {
    id: "secret-codes",
    schema: {
      user: {
        fields: {
          secretCodesConfirmed: {
            type: "boolean",
            defaultValue: false,
            required: false,
            input: false, // SECURITY: Prevent direct manipulation via registration/update APIs
            returned: true, // UI needs this for conditional rendering
          },
          secretCodeVerificationId: {
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
      generateSecretCodes: createAuthEndpoint(
        "/secret-codes/generate",
        {
          method: "POST",
          body: z.object({
            password: z.string().describe("User password").optional(),
          }),
          use: [sessionMiddleware],
          metadata: {
            openapi: {
              summary: "Generate secret codes",
              description:
                "Use this endpoint to generate secret codes. This will set the secret codes for the user's account.",
              responses: {
                200: {
                  description: "Successful response",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          secretCodes: {
                            type: "array",
                            items: {
                              type: "string",
                            },
                            description: "Secret codes",
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
            const { secretCodes, verificationId } =
              await orpc.user.secretCodes.generate.call(ctx.body);

            await updateSession(ctx, {
              secretCodeVerificationId: verificationId,
            });

            return await ctx.json({ secretCodes });
          } catch (error) {
            // ERROR BOUNDARY: Convert ORPC errors to Better Auth APIError format
            // WHY: Maintains consistent error handling across authentication endpoints
            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: "Secret codes could not be set",
              cause: error,
            });
          }
        }
      ),
      confirmSecretCodes: createAuthEndpoint(
        "/secret-codes/confirm",
        {
          method: "POST",
          body: z.object({
            stored: z
              .boolean()
              .describe("Whether the secret codes were stored"),
          }),
          use: [sessionMiddleware],
          metadata: {
            openapi: {
              summary: "Confirm secret codes",
              description: "Use this endpoint to confirm secret codes.",
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
                            description: "Secret codes confirmation received",
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
            const { success } = await orpc.user.secretCodes.confirm.call(
              ctx.body
            );

            await updateSession(ctx, {
              secretCodesConfirmed: success,
            });

            return await ctx.json({ success });
          } catch (error) {
            // ERROR BOUNDARY: Convert ORPC errors to Better Auth APIError format
            // WHY: Maintains consistent error handling across authentication endpoints
            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: "Secret codes could not be confirmed",
              cause: error,
            });
          }
        }
      ),
    },
    /**
     * Rate limiting configuration for secret code endpoints.
     *
     * @remarks
     * SECURITY: Prevents abuse of backup code generation and confirmation
     * endpoints. Backup codes are sensitive authentication factors that
     * require protection against automated attacks.
     *
     * RATIONALE: The 3/10s limit balances security with legitimate use:
     * - Prevents automated generation of multiple code sets
     * - Allows for user errors during confirmation process
     * - Covers both /secret-codes/generate and /secret-codes/confirm
     *
     * ATTACK VECTORS MITIGATED:
     * - Automated code generation flooding Portal API
     * - Rapid confirmation attempts to bypass storage verification
     * - Resource exhaustion attacks on cryptographic operations
     */
    rateLimit: [
      {
        pathMatcher(path) {
          return path.startsWith("/secret-codes/"); // WHY: Covers all secret code endpoints
        },
        window: 10, // SECURITY: 10-second window prevents rapid-fire attacks
        max: 3, // SECURITY: 3 attempts allows for user error while blocking automation
      },
    ],
  } satisfies BetterAuthPlugin;
};

import type { SessionUser } from "@/lib/auth";
import { validatePassword } from "@/lib/auth/plugins/utils";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import type { BetterAuthPlugin } from "better-auth";
import {
  APIError,
  createAuthEndpoint,
  sessionMiddleware,
} from "better-auth/api";
import { z } from "zod";
import { updateSession } from "../utils";

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
          const user = ctx.context.session.user as SessionUser;
          const { password } = ctx.body;
          // Skip password validation if the user has not confirmed the secret codes yet
          if (user.secretCodesConfirmed) {
            if (!password) {
              throw new APIError("BAD_REQUEST", {
                message: "Password is required",
              });
            }
            const isPasswordValid = await validatePassword(ctx, {
              password,
              userId: user.id,
            });
            if (!isPasswordValid) {
              throw new APIError("BAD_REQUEST", {
                message: "Invalid password",
              });
            }
          }
          if (user.secretCodeVerificationId) {
            await portalClient.request(REMOVE_SECRET_CODES_MUTATION, {
              address: user.wallet,
              verificationId: user.secretCodeVerificationId,
            });
          }
          const result = await portalClient.request(
            GENERATE_SECRET_CODES_MUTATION,
            {
              address: user.wallet,
            }
          );
          if (!result.createWalletVerification?.id) {
            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: "Failed to create wallet verification",
            });
          }

          await updateSession(ctx, {
            secretCodeVerificationId: result.createWalletVerification.id,
          });
          const parameters = result.createWalletVerification.parameters as {
            secretCodes?: string;
          };
          return ctx.json({
            secretCodes: parameters.secretCodes?.split(",") ?? [],
          });
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
          const { stored } = ctx.body;
          if (stored) {
            await updateSession(ctx, {
              secretCodesConfirmed: true,
            });
          }
          return ctx.json({
            success: stored,
          });
        }
      ),
    },
    rateLimit: [
      {
        pathMatcher(path) {
          return path.startsWith("/secret-codes/");
        },
        window: 10,
        max: 3,
      },
    ],
  } satisfies BetterAuthPlugin;
};

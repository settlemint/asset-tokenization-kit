import type { SessionUser } from "@/lib/auth";
import { isOnboarded, validatePassword } from "@/lib/auth/plugins/utils";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import type { BetterAuthPlugin } from "better-auth";
import {
  APIError,
  createAuthEndpoint,
  sessionMiddleware,
} from "better-auth/api";
import { z } from "zod/v4";
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
          if (isOnboarded(user)) {
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

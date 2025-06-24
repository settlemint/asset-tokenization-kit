import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import type { EthereumAddress } from "@/lib/zod/validators/ethereum-address";
import type { BetterAuthPlugin } from "better-auth";
import {
  APIError,
  createAuthEndpoint,
  sessionMiddleware,
} from "better-auth/api";
import { revokeSession } from "../utils";

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

export interface UserWithSecretCodesContext {
  wallet?: EthereumAddress;
  secretCodeVerificationId?: string;
}

export const secretCodes = () => {
  return {
    id: "secret-codes",
    endpoints: {
      generate: createAuthEndpoint(
        "/secret-codes/generate",
        {
          method: "GET",
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
          const user = ctx.context.session.user as UserWithSecretCodesContext;
          if (!user.wallet) {
            throw new APIError("BAD_REQUEST", {
              message: "User wallet not found",
            });
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

          await revokeSession(ctx, {
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

import type { User } from "@/lib/auth/types";
// import { generateSecretCodesFunction } from "@/lib/mutations/user/security-codes/generate-secret-codes-function";
import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import { revokeSession } from "../utils";

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
          const user = ctx.context.session.user as User;
          // TODO JAN: Remove this once we have the mutation
          // const result = await generateSecretCodesFunction({
          //   ctx: { user },
          // });
          const result = {
            verificationId: "123",
            secretCodes: ["123", "456", "789"],
          };
          await revokeSession(ctx, {
            secretCodeVerificationId: result.verificationId,
          });
          return ctx.json({ secretCodes: result.secretCodes });
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

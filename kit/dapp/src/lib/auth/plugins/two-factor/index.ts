import type { SessionUser } from "@/lib/auth";
import {
  disableTwoFactor,
  enableTwoFactor,
  verifyTwoFactorOTP,
} from "@/lib/auth/plugins/two-factor/queries";
import type { BetterAuthPlugin, GenericEndpointContext } from "better-auth";
import {
  APIError,
  createAuthEndpoint,
  sessionMiddleware,
} from "better-auth/api";
import { z } from "zod";
import { isOnboarded, updateSession, validatePassword } from "../utils";

const OTP_DIGITS = 6;
const OTP_PERIOD = 30;
const OTP_ALGORITHM = "SHA256";

export const twoFactor = () => {
  return {
    id: "two-factor",
    endpoints: {
      enableTwoFactor: createAuthEndpoint(
        "/two-factor/enable",
        {
          method: "POST",
          body: z.object({
            password: z
              .string()
              .describe(
                "User password, only required if the user has done the initial onboarding"
              )
              .optional(),
            issuer: z
              .string()
              .describe("Custom issuer for the TOTP URI")
              .optional(),
          }),
          use: [sessionMiddleware],
          metadata: {
            openapi: {
              summary: "Enable two factor authentication",
              description:
                "Use this endpoint to enable two factor authentication. This will generate a TOTP URI and backup codes. Once the user verifies the TOTP URI, the two factor authentication will be enabled.",
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
          const user = ctx.context.session.user as SessionUser;
          const { password } = ctx.body;
          // Skip password validation during onboarding flow
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
          const { totpURI, verificationId } = await enableTwoFactor(
            {
              algorithm: OTP_ALGORITHM,
              digits: OTP_DIGITS,
              period: OTP_PERIOD,
            },
            user
          );
          await updateSession(ctx, {
            twoFactorEnabled: false, // Set when first otp is verified successfully
            twoFactorVerificationId: verificationId,
          });
          return ctx.json({ totpURI });
        }
      ),
      disableTwoFactor: createAuthEndpoint(
        "/two-factor/disable",
        {
          method: "POST",
          body: z.object({
            password: z.string().describe("User password"),
          }),
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
          const user = ctx.context.session.user as SessionUser;
          const isPasswordValid = await validatePassword(ctx, {
            password: ctx.body.password,
            userId: user.id,
          });
          if (!isPasswordValid) {
            throw new APIError("BAD_REQUEST", {
              message: "Invalid password",
            });
          }
          await disableTwoFactor(user);
          await updateSession(ctx, {
            twoFactorEnabled: false,
            twoFactorVerificationId: null,
          });

          return ctx.json({ status: true });
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
          const user = ctx.context.session.user as SessionUser;
          const { code } = ctx.body;
          const result = await verifyTwoFactorOTP(user, code);
          if (!result.verified) {
            throw new APIError("UNAUTHORIZED", {
              message: "Invalid two factor code",
            });
          }
          if (!user.twoFactorEnabled) {
            await updateSession(ctx as GenericEndpointContext, {
              twoFactorEnabled: true,
            });
          }
          return ctx.json({ status: true });
        }
      ),
    },
    rateLimit: [
      {
        pathMatcher(path) {
          return path.startsWith("/two-factor/");
        },
        window: 10,
        max: 3,
      },
    ],
  } satisfies BetterAuthPlugin;
};

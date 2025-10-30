import type { SessionUser } from "@/lib/auth";
import {
  removePincode,
  setPincode,
  updatePincode,
} from "@/lib/auth/plugins/pincode-plugin/queries";
import type { BetterAuthPlugin } from "better-auth";
import {
  APIError,
  createAuthEndpoint,
  sessionMiddleware,
} from "better-auth/api";
import { z } from "zod";
import { isOnboarded, updateSession, validatePassword } from "../utils";

export const pincode = () => {
  return {
    id: "pincode",
    endpoints: {
      enablePincode: createAuthEndpoint(
        "/pincode/enable",
        {
          method: "POST",
          body: z.object({
            pincode: z.string().describe("The pincode for wallet verification"),
            password: z
              .string()
              .describe(
                "User password (only required if the user has done the initial onboarding)"
              )
              .optional(),
          }),
          use: [sessionMiddleware],
          metadata: {
            openapi: {
              summary: "Enable pincode",
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
          const user = ctx.context.session.user as SessionUser;
          const { password, pincode } = ctx.body;
          if (user.pincodeEnabled && user.pincodeVerificationId) {
            throw new APIError("BAD_REQUEST", {
              message: "Pincode already set",
            });
          }
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
          const pincodeVerificationId = await setPincode(user, pincode);
          await updateSession(ctx, {
            pincodeEnabled: true,
            pincodeVerificationId,
          });
          return ctx.json({ success: true });
        }
      ),
      disablePincode: createAuthEndpoint(
        "/pincode/disable",
        {
          method: "POST",
          body: z.object({
            password: z.string({
              message: "User password",
            }),
          }),
          use: [sessionMiddleware],
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
          const user = ctx.context.session.user as SessionUser;
          const { pincodeEnabled, pincodeVerificationId } = user;
          if (!pincodeEnabled || !pincodeVerificationId) {
            throw new APIError("BAD_REQUEST", {
              message: "Pincode already removed",
            });
          }
          const { password } = ctx.body;
          const isPasswordValid = await validatePassword(ctx, {
            password,
            userId: user.id,
          });
          if (!isPasswordValid) {
            throw new APIError("BAD_REQUEST", {
              message: "Invalid password",
            });
          }
          const success = await removePincode(user, pincodeVerificationId);
          await updateSession(ctx, {
            pincodeEnabled: false,
          });
          return ctx.json({
            success,
          });
        }
      ),
      updatePincode: createAuthEndpoint(
        "/pincode/update",
        {
          method: "POST",
          body: z.object({
            password: z.string({
              message: "User password",
            }),
            newPincode: z.string({
              message: "New pincode",
            }),
          }),
          use: [sessionMiddleware],
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
          const user = ctx.context.session.user as SessionUser;
          const { password, newPincode } = ctx.body;
          const isPasswordValid = await validatePassword(ctx, {
            password,
            userId: user.id,
          });
          if (!isPasswordValid) {
            throw new APIError("BAD_REQUEST", {
              message: "Invalid password",
            });
          }
          const pincodeVerificationId = await updatePincode(user, newPincode);
          await updateSession(ctx, {
            pincodeVerificationId,
          });
          return ctx.json({ success: true });
        }
      ),
    },
    rateLimit: [
      {
        pathMatcher(path) {
          return path.startsWith("/pincode/");
        },
        window: 10,
        max: 3,
      },
    ],
  } satisfies BetterAuthPlugin;
};

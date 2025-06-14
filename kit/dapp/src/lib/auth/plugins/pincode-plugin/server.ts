import type { User } from "@/lib/auth/types";
import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import { APIError } from "better-call";
import { z } from "zod";
import { revokeSession, validatePassword } from "../utils";

export const pincode = () => {
  return {
    id: "pincode",
    endpoints: {
      enablePincode: createAuthEndpoint(
        "/pincode/enable",
        {
          method: "POST",
          body: z.object({
            pincode: z.string({
              message: "The pincode for wallet verification",
            }),
            password: z
              .string({
                message:
                  "User password (only required if the user has done the initial onboarding)",
              })
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
          const user = ctx.context.session.user as User;
          const { password, pincode } = ctx.body;
          if (user.initialOnboardingFinished) {
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
          const result = await setPincodeFunction({
            parsedInput: { pincode },
            ctx: { user },
          });
          await revokeSession(ctx, {
            initialOnboardingFinished: true,
            pincodeEnabled: true,
            pincodeVerificationId: result.verificationId,
          });
          return ctx.json({ success: result.success });
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
          const user = ctx.context.session.user as User;
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
          // TODO JASON: Remove this once we have the mutation
          // const result = await removePincodeFunction({ ctx: { user } });
          const result = { success: true };
          await revokeSession(ctx, {
            pincodeEnabled: false,
          });
          return ctx.json({ success: result.success });
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
          const user = ctx.context.session.user as User;
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
          // TODO JAN: Remove this once we have the mutation
          const result = { success: true, verificationId: "123" };
          // const result = await updatePincodeFunction({
          //   parsedInput: { pincode: newPincode },
          //   ctx: { user },
          // });
          await revokeSession(ctx, {
            pincodeVerificationId: result.verificationId,
          });
          return ctx.json({ success: result.success });
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

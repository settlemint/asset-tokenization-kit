import { orpc } from "@/orpc/orpc-client";
import { pincode as pincodeValidator } from "@atk/zod/pincode";
import type { BetterAuthPlugin } from "better-auth";
import {
  APIError,
  createAuthEndpoint,
  sessionMiddleware,
} from "better-auth/api";
import { z } from "zod";

export const pincode = () => {
  return {
    id: "pincode",
    schema: {
      user: {
        fields: {
          pincodeEnabled: {
            type: "boolean",
            defaultValue: false,
            required: false,
            input: false,
            returned: true,
          },
          pincodeVerificationId: {
            type: "string",
            required: false,
            unique: true,
            input: false,
            returned: true,
          },
        },
      },
    },
    endpoints: {
      enablePincode: createAuthEndpoint(
        "/pincode/enable",
        {
          method: "POST",
          body: z.object({
            pincode: pincodeValidator,
          }),
          use: [sessionMiddleware],
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
            const { success, verificationId } =
              await orpc.user.pincode.set.call(ctx.body);
            if (success) {
              await ctx.context.internalAdapter.updateSession(
                ctx.context.session.user.id,
                {
                  pincodeEnabled: true,
                  pincodeVerificationId: verificationId,
                }
              );
            }
          } catch (error) {
            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: "Pincode could not be set",
              cause: error,
            });
          }
          return ctx.json({ success: true });
        }
      ),
      disablePincode: createAuthEndpoint(
        "/pincode/disable",
        {
          method: "DELETE",
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
          try {
            const { success } = await orpc.user.pincode.remove.call(ctx.body);
            if (success) {
              await ctx.context.internalAdapter.updateSession(
                ctx.context.session.user.id,
                {
                  pincodeEnabled: false,
                  pincodeVerificationId: null,
                }
              );
            }
          } catch (error) {
            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: "Pincode could not be disabled",
              cause: error,
            });
          }
          return ctx.json({ success: true });
        }
      ),
      updatePincode: createAuthEndpoint(
        "/pincode/update",
        {
          method: "PATCH",
          body: z.object({
            newPincode: pincodeValidator,
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
          try {
            const { success, verificationId } =
              await orpc.user.pincode.update.call({
                pincode: ctx.body.newPincode,
              });
            if (success) {
              await ctx.context.internalAdapter.updateSession(
                ctx.context.session.user.id,
                {
                  pincodeEnabled: true,
                  pincodeVerificationId: verificationId,
                }
              );
            }
          } catch (error) {
            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: "Pincode could not be set",
              cause: error,
            });
          }
          return ctx.json({ success: true });
        }
      ),
    },
    rateLimit: [
      {
        pathMatcher(path) {
          return path.startsWith("/pincode");
        },
        window: 10,
        max: 3,
      },
    ],
  } satisfies BetterAuthPlugin;
};

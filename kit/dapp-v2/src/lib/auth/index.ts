import { metadata } from "@/config/metadata";
import { ethereumAddress } from "@/lib/zod/validators/ethereum-address";
import { serverOnly } from "@tanstack/react-start";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, apiKey, openAPI } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { reactStartCookies } from "better-auth/react-start";
import { db } from "../db";
import * as authSchema from "../db/schemas/auth";
import { env } from "../env";

const getAuthConfig = serverOnly(() =>
  betterAuth({
    appName: metadata.title,
    secret: env.SETTLEMINT_HASURA_ADMIN_SECRET,
    baseURL: env.APP_URL,
    basePath: "/api/auth",
    ...(env.APP_URL && { trustedOrigins: [env.APP_URL] }),
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: authSchema,
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    user: {
      deleteUser: {
        enabled: true,
      },
      changeEmail: {
        enabled: true,
      },
      additionalFields: {
        wallet: {
          transform: {
            input(value) {
              return ethereumAddress.optional().parse(value);
            },
            output(value) {
              return ethereumAddress.optional().parse(value);
            },
          },
          type: "string",
          required: false,
          unique: true,
          input: false,
        },
      },
    },
    session: {
      session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
        freshAge: 60 * 5, // 5 minutes (the session is fresh if created within the last 5 minutes)
      },
      cookieCache: {
        enabled: true,
        maxAge: 10 * 60,
      },
    },
    rateLimit: {
      window: 10, // time window in seconds
      max: 100, // max requests in the window
    },
    plugins: [
      admin(),
      apiKey({
        defaultKeyLength: 16,
        defaultPrefix: "sm_atk_",
        enableMetadata: true,
        rateLimit: {
          enabled: true,
          timeWindow: 1000 * 60, // 1 minute
          maxRequests: 60, // 60 requests per minute
        },
        permissions: {
          defaultPermissions: {
            planets: ["read"],
          },
        },
      }),
      passkey({
        rpName: metadata.title,
      }),
      openAPI(),
      reactStartCookies(),
    ],
  })
);

export const auth = getAuthConfig();

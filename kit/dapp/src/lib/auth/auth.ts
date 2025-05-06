import {
  emailVerification,
  sendChangeEmailVerification,
  sendDeleteAccountVerification,
  sendMagicLink,
} from "@/lib/auth/emails";
import * as authSchema from "@/lib/db/schema-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { admin, apiKey, magicLink } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getServerEnvironment } from "../config/environment";
import { metadata } from "../config/metadata";
import { db } from "../db";
import { accessControl, adminRole, issuerRole, userRole } from "./permissions";
import { pincode } from "./plugins/pincode-plugin";
import { secretCodes } from "./plugins/secret-codes-plugin";
import twoFactorPlugin from "./plugins/two-factor";
import { createUserWallet } from "./portal";

const env = getServerEnvironment();

const hasEmailConfigured = env.RESEND_API_KEY !== undefined;

/**
 * Authentication configuration using better-auth
 */
export const auth = betterAuth({
  appName: metadata.title.default,
  secret: env.SETTLEMINT_HASURA_ADMIN_SECRET,
  baseURL: env.APP_URL,
  basePath: "/api/auth",
  trustedOrigins: [env.APP_URL],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  socialProviders: {
    ...(env.GOOGLE_CLIENT_ID &&
      env.GOOGLE_CLIENT_SECRET && {
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
      }),
    ...(env.GITHUB_CLIENT_ID &&
      env.GITHUB_CLIENT_SECRET && {
        github: {
          clientId: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
        },
      }),
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: hasEmailConfigured,
  },
  emailVerification,
  user: {
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification,
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification,
    },
    additionalFields: {
      wallet: {
        type: "string",
        required: false,
        unique: true,
      },
      kycVerifiedAt: {
        type: "date",
        required: false,
        input: false,
      },
      lastLoginAt: {
        type: "date",
        required: false,
        input: false,
      },
      role: {
        type: "string",
        required: true,
        default: "user",
        input: false,
      },
      currency: {
        type: "string",
        required: false,
        default: "EUR",
        input: true,
        validator: {
          input: z.enum([
            "USD",
            "EUR",
            "JPY",
            "AED",
            "SGD",
            "SAR",
            "GBP",
            "CHF",
          ]),
        },
      },
      pincodeEnabled: {
        type: "boolean",
        required: false,
        default: false,
        input: false,
      },
      pincodeVerificationId: {
        type: "string",
        required: false,
        unique: true,
        input: false,
      },
      twoFactorVerificationId: {
        type: "string",
        required: false,
        unique: true,
        input: false,
      },
      secretCodeVerificationId: {
        type: "string",
        required: false,
        unique: true,
        input: false,
      },
      initialOnboardingFinished: {
        type: "boolean",
        required: false,
        default: false,
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          try {
            const wallet = await createUserWallet({
              keyVaultId: env.SETTLEMINT_HD_PRIVATE_KEY,
              name: user.email,
            });

            if (!wallet.createWallet?.address) {
              throw new APIError("BAD_REQUEST", {
                message: "Failed to create wallet",
              });
            }

            const firstUser = await db.query.user.findFirst();
            return {
              data: {
                ...user,
                wallet: wallet.createWallet.address,
                role: firstUser ? "user" : "admin",
              },
            };
          } catch (error) {
            throw new APIError("BAD_REQUEST", {
              message: "Failed to create user wallet",
              cause: error instanceof Error ? error : undefined,
            });
          }
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          await db
            .update(authSchema.user)
            .set({ lastLoginAt: new Date() })
            .where(eq(authSchema.user.id, session.userId));
          return {
            data: session,
          };
        },
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
  plugins: [
    admin({
      ac: accessControl,
      roles: {
        admin: adminRole,
        user: userRole,
        issuer: issuerRole,
      },
    }),
    apiKey({
      defaultKeyLength: 16,
      defaultPrefix: "sm_atk_",
      enableMetadata: true,
      rateLimit: {
        enabled: true,
        timeWindow: 1000 * 60, // 1 minute
        maxRequests: 60, // 60 requests per minute
      },
    }),
    passkey({
      rpName: metadata.title.default,
    }),
    twoFactorPlugin,
    pincode(),
    secretCodes(),
    magicLink({
      sendMagicLink,
    }),
    nextCookies(),
  ],
});

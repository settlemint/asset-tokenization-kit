import { EmailTemplate } from "@/components/email/EmailTemplate";
import * as authSchema from "@/lib/db/schema-auth";
import { betterAuth } from "better-auth";
import { emailHarmony } from "better-auth-harmony";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { getEnvironment } from "../config/environment";
import { metadata } from "../config/metadata";
import { db } from "../db";
import { createUserWallet } from "./portal";

// Validate environment variables at startup
const env = getEnvironment();

const hasEmailConfigured = env.RESEND_API_KEY !== undefined;
const resend = hasEmailConfigured ? new Resend(env.RESEND_API_KEY) : undefined;

/**
 * Authentication configuration using better-auth
 */
export const auth = betterAuth({
  appName: metadata.title.default,
  secret: getEnvironment().SETTLEMINT_HASURA_ADMIN_SECRET,
  baseURL: getEnvironment().BETTER_AUTH_URL,
  trustedOrigins: [getEnvironment().BETTER_AUTH_URL],
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
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      if (!hasEmailConfigured || !resend) {
        throw new Error("Email is not configured");
      }
      const name =
        (user.name || user.email.split("@")[0]).charAt(0).toUpperCase() +
        (user.name || user.email.split("@")[0]).slice(1);

      await resend.emails.send({
        from: "Verify Email <verify@settlemint.com>",
        to: user.email,
        subject: "Verify your email address",
        react: EmailTemplate({
          action: "Verify Email",
          content: (
            <>
              <p>{`Hello ${name},`}</p>

              <p>Click the button below to verify your email address.</p>
            </>
          ),
          heading: "Verify Email",
          url,
        }),
      });
    },
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
  },
  user: {
    additionalFields: {
      wallet: {
        type: "string",
        required: true,
        unique: true,
        input: false,
      },
      kycVerifiedAt: {
        type: "date",
        required: false,
      },
      lastLoginAt: {
        type: "date",
        required: false,
      },
      role: {
        type: "string",
        required: true,
        default: "user",
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
              keyVaultId: getEnvironment().SETTLEMINT_HD_PRIVATE_KEY,
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
    cookieCache: {
      enabled: true,
      maxAge: 10 * 60,
    },
  },
  plugins: [
    admin(),
    passkey({
      rpName: metadata.title.default,
    }),
    emailHarmony(),
    nextCookies(),
  ],
});

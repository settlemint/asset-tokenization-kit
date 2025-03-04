import { redirect } from "@/i18n/routing";
import * as authSchema from "@/lib/db/schema-auth";
import { betterAuth } from "better-auth";
import { emailHarmony } from "better-auth-harmony";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import type { RedirectType } from 'next/navigation';
import { metadata } from "../config/metadata";
import { db } from "../db";
import { validateEnvironmentVariables } from "./config";
import { createUserWallet } from "./portal";

// Validate environment variables at startup
validateEnvironmentVariables();

/**
 * Authentication configuration using better-auth
 */
export const auth = betterAuth({
  appName: metadata.title.default,
  secret: process.env.SETTLEMINT_HASURA_ADMIN_SECRET ?? '',
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      wallet: {
        type: "string",
        required: true,
        unique: true,
      },
      kycVerifiedAt: {
        type: "date",
        required: false,
      },
      lastLoginAt: {
        type: "date",
        required: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          try {
            const wallet = await createUserWallet({
              keyVaultId: process.env.SETTLEMINT_HD_PRIVATE_KEY ?? '',
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

/**
 * Get the current session from the request headers
 * @throws {AuthError} If no session is found
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect({ href: '/auth/signin', locale: 'en' }, 'replace' as RedirectType);
  }

  return session as NonNullable<typeof session>;
}

/**
 * Get the currently authenticated user
 * @returns The authenticated user
 * @throws {AuthError} If user is not authenticated
 */
export async function getAuthenticatedUser() {
  const session = await getSession();

  if (!session?.user) {
    redirect({ href: '/auth/signin', locale: 'en' }, 'replace' as RedirectType);
  }

  return session.user;
}

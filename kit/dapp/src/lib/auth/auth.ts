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
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import type { RedirectType } from "next/navigation";
import { getEnvironment, validateEnvironment } from "../config/environment";
import { metadata } from "../config/metadata";
import { db } from "../db";
import { createUserWallet } from "./portal";

// Validate environment variables at startup
validateEnvironment();

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
          revalidateTag("user");
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
 * @returns The authenticated user
 * @throws Redirects to signin if not authenticated
 */
export async function getAuthenticatedUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect({ href: "/auth/signin", locale: "en" }, "replace" as RedirectType);
  }

  return (
    session?.user ?? {
      wallet: "0x0000000000000000000000000000000000000000",
    }
  );
}

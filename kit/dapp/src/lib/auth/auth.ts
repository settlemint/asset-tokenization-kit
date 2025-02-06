import * as authSchema from '@/lib/db/schema-auth';
import { betterAuth } from 'better-auth';
import { emailHarmony } from 'better-auth-harmony';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { APIError } from 'better-auth/api';
import { nextCookies } from 'better-auth/next-js';
import { admin, openAPI } from 'better-auth/plugins';
import { passkey } from 'better-auth/plugins/passkey';
import { headers } from 'next/headers';
import { metadata } from '../config/metadata';
import { db } from '../db';
import { validateEnvironmentVariables } from './config';
import { createUserWallet } from './portal';

/**
 * Custom error class for authentication-related errors
 */
export class AuthError extends Error {
  readonly code: 'SESSION_NOT_FOUND' | 'USER_NOT_AUTHENTICATED';
  readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: 'SESSION_NOT_FOUND' | 'USER_NOT_AUTHENTICATED',
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.context = context;
  }
}

// Validate environment variables at startup
validateEnvironmentVariables();

/**
 * Authentication configuration using better-auth
 */
export const auth = betterAuth({
  appName: metadata.title.default,
  secret: process.env.SETTLEMINT_HASURA_ADMIN_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  trustedOrigins: [process.env.BETTER_AUTH_URL || 'http://localhost:3000'],
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: authSchema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      wallet: {
        type: 'string',
        required: true,
        unique: true,
      },
      kycVerifiedAt: {
        type: 'date',
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
              keyVaultId: process.env.SETTLEMINT_HD_PRIVATE_KEY!,
              name: user.email,
            });

            if (!wallet.createWallet?.address) {
              throw new APIError('BAD_REQUEST', {
                message: 'Failed to create wallet',
              });
            }

            const firstUser = await db.query.user.findFirst();
            return {
              data: {
                ...user,
                wallet: wallet.createWallet.address,
                role: firstUser ? 'user' : 'admin',
              },
            };
          } catch (error) {
            throw new APIError('BAD_REQUEST', {
              message: 'Failed to create user wallet',
              cause: error instanceof Error ? error : undefined,
            });
          }
        },
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  plugins: [nextCookies(), admin(), passkey(), openAPI(), emailHarmony()],
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
    throw new AuthError('User does not have a session', 'SESSION_NOT_FOUND');
  }

  return session;
}

/**
 * Get the currently authenticated user
 * @returns {Promise<AuthenticatedUser>} The authenticated user
 * @throws {AuthError} If user is not authenticated
 */
export async function getAuthenticatedUser() {
  const session = await getSession();

  if (!session?.user) {
    throw new AuthError('User not authenticated', 'USER_NOT_AUTHENTICATED');
  }

  return session.user;
}

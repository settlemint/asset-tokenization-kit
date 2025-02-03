import * as authSchema from '@/lib/db/schema-auth';
import { metadata } from '@/lib/site-config';
import { slugify } from '@/lib/slugify';
import { betterAuth } from 'better-auth';
import { emailHarmony } from 'better-auth-harmony';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { APIError } from 'better-auth/api';
import { nextCookies } from 'better-auth/next-js';
import { admin, openAPI, organization } from 'better-auth/plugins';
import { passkey } from 'better-auth/plugins/passkey';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { db } from '../db';
import { validateEnvironmentVariables } from './config';
import { createUserWallet } from './portal';

const DEFAULT_USER_ORGANIZATION_NAME = 'Users';
// const DEFAULT_ADMIN_ORGANIZATION_NAME = 'Admins';

/**
 * Custom error class for authentication-related errors
 */
export class AuthError extends Error {
  readonly code: 'SESSION_NOT_FOUND' | 'USER_NOT_AUTHENTICATED' | 'NO_ACTIVE_ORGANIZATION';
  readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: 'SESSION_NOT_FOUND' | 'USER_NOT_AUTHENTICATED' | 'NO_ACTIVE_ORGANIZATION',
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.context = context;
  }
}

/**
 * Type for the authenticated user
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  wallet: string;
  role: 'admin' | 'user';
  organizationId?: string;
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
            const defaultOrganization = await db.query.organization.findFirst({
              where: eq(authSchema.organization.name, DEFAULT_USER_ORGANIZATION_NAME),
            });
            const firstUser = await db.query.user.findFirst();
            return {
              data: {
                ...user,
                wallet: wallet.createWallet.address,
                role: firstUser && defaultOrganization ? 'user' : 'admin',
              },
            };
          } catch (error) {
            throw new APIError('BAD_REQUEST', {
              message: 'Failed to create user wallet',
              cause: error instanceof Error ? error : undefined,
            });
          }
        },
        after: async (user) => {
          try {
            const defaultOrganization = await db.query.organization.findFirst({
              where: eq(authSchema.organization.name, DEFAULT_USER_ORGANIZATION_NAME),
            });
            let defaultOrganizationId = defaultOrganization?.id;
            const authHeaders = await headers();
            if (!defaultOrganization) {
              const newOrg = await auth.api.createOrganization({
                headers: authHeaders,
                body: {
                  name: DEFAULT_USER_ORGANIZATION_NAME,
                  slug: slugify(DEFAULT_USER_ORGANIZATION_NAME, { unique: true }),
                },
              });
              defaultOrganizationId = newOrg?.id;
            }
            await auth.api.addMember({
              body: {
                userId: user.id,
                organizationId: defaultOrganizationId,
                role: 'member',
              },
              headers: authHeaders,
            });

            await auth.api.setActiveOrganization({
              body: {
                organizationId: defaultOrganizationId,
              },
              headers: authHeaders,
            });
          } catch (error) {
            throw new APIError('BAD_REQUEST', {
              message: 'Failed to add user to the default organization',
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
  plugins: [
    nextCookies(),
    admin(),
    organization({
      allowUserToCreateOrganization: async (user) => {
        const userFromDb = await db.query.user.findFirst({ where: eq(authSchema.user.id, user.id) });
        return userFromDb?.role === 'admin';
      },
    }),
    passkey(),
    openAPI(),
    emailHarmony(),
  ],
});

/**
 * Get the current session from the request headers
 * @throws {AuthError} If no session is found
 */
async function getSession() {
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
export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
  const session = await getSession();

  if (!session?.user) {
    throw new AuthError('User not authenticated', 'USER_NOT_AUTHENTICATED');
  }

  return session.user as AuthenticatedUser;
}

/**
 * Get the active organization ID for the current user
 * @returns {Promise<string>} The active organization ID
 * @throws {AuthError} If no active organization is found
 */
export async function getActiveOrganizationId(): Promise<string> {
  const session = await getSession();

  if (!session?.session?.activeOrganizationId) {
    throw new AuthError('User does not have an active organization', 'NO_ACTIVE_ORGANIZATION');
  }

  return session.session.activeOrganizationId;
}

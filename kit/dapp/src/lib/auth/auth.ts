import * as authSchema from '@/lib/db/schema-auth';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { betterAuth } from 'better-auth';
import { emailHarmony } from 'better-auth-harmony';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { APIError } from 'better-auth/api';
import { nextCookies } from 'better-auth/next-js';
import { admin, openAPI } from 'better-auth/plugins';
import { db } from '../db';

const createUserWallet = portalGraphql(`
  mutation createUserWallet($keyVaultId: String!, $name: String!) {
    createWallet(keyVaultId: $keyVaultId, walletInfo: { name: $name }) {
      address
    }
  }
`);

export const auth = betterAuth({
  secret: process.env.SETTLEMINT_HASURA_ADMIN_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
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
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const wallet = await portalClient.request(createUserWallet, {
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
        },
      },
    },
  },
  plugins: [nextCookies(), admin(), openAPI(), emailHarmony({ allowNormalizedSignin: true })],
});

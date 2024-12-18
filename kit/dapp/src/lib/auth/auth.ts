import * as authSchema from '@/lib/db/schema-auth';
import { betterAuth } from 'better-auth';
import { emailHarmony } from 'better-auth-harmony';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { admin, openAPI } from 'better-auth/plugins';
import { db } from '../db';

export const auth = betterAuth({
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
        input: false,
      },
    },
  },
  plugins: [nextCookies(), admin(), openAPI(), emailHarmony({ allowNormalizedSignin: true })],
});

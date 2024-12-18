import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import type { auth } from './auth';

export const { signIn, signUp, signOut, useSession } = createAuthClient({
  baseURL:
    typeof window !== 'undefined' ? window.location.origin : (process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'),
  plugins: [inferAdditionalFields<typeof auth>(), adminClient()],
});

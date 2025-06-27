import {
  adminClient,
  apiKeyClient,
  inferAdditionalFields,
  passkeyClient,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import type { auth } from '@/lib/auth';
import {
  accessControl,
  adminRole,
  investorRole,
  issuerRole,
} from '@/lib/auth/permissions';
import { pincodeClient } from '@/lib/auth/plugins/pincode-plugin/client';
import { secretCodesClient } from '@/lib/auth/plugins/secret-codes-plugin/client';
import { twoFactorClient } from '@/lib/auth/plugins/two-factor/client';
import { walletClient } from '@/lib/auth/plugins/wallet-plugin/client';

export const authClient = createAuthClient({
  baseURL: 'http://localhost:3000/api/auth',
  plugins: [
    inferAdditionalFields<typeof auth>(),
    adminClient({
      ac: accessControl,
      roles: {
        admin: adminRole,
        investor: investorRole,
        issuer: issuerRole,
      },
    }),
    apiKeyClient(),
    passkeyClient(),
    pincodeClient(),
    twoFactorClient(),
    secretCodesClient(),
    walletClient(),
  ],
});

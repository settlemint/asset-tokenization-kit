'use server';

import { db } from '@/lib/db';
import { actionClient } from '@/lib/safe-action';
import { hasuraClient } from '@/lib/settlemint/hasura';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import {} from 'bcryptjs';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { zfd } from 'zod-form-data';

type AggregateCount = {
  starterkit_wallets_aggregate: {
    aggregate: {
      count: number;
    } | null;
  };
};

const createUserWallet = portalGraphql(`
  mutation createUserWallet($keyVaultId: String!, $name: String!) {
    createWallet(keyVaultId: $keyVaultId, walletInfo: { name: $name }) {
      address
    }
  }
`);

export const createWalletAction = actionClient
  .schema(
    zfd.formData({
      username: zfd.text(z.string().email()),
    })
  )
  .action(async ({ parsedInput }) => {
    try {
      const existingWallet = await db.query.starterkit_wallets.findFirst({

      const walletCount = await hasuraClient.request(walletExists, { email: parsedInput.username });

      if ((walletCount as AggregateCount).starterkit_wallets_aggregate.aggregate?.count === 0) {
        const hasAdmin = await hasuraClient.request(hasAtLeastOneAdmin);
        const role = [
          ((hasAdmin as AggregateCount).starterkit_wallets_aggregate.aggregate?.count ?? 0) > 0 ? 'user' : 'admin',
        ];

        const wallet = await portalClient.request(createUserWallet, {
          keyVaultId: process.env.SETTLEMINT_HD_PRIVATE_KEY!,
          name: parsedInput.username,
        });

        return wallet.createWallet?.address;
      }

      const decodedRedirectUrl = redirectUrl ? decodeURIComponent(redirectUrl) : undefined;
      return await signIn(provider, { ...formData, redirectTo: decodedRedirectUrl ?? '/' });
    } catch (error) {
      if (error instanceof AuthError) {
        return redirect(`/auth/error?error=${error.type}`);
      }
      throw error;
    }
  });

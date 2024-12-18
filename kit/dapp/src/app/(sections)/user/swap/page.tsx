import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import type { Address } from 'viem';
import { Swap } from './_components/swap';

export default async function UserSwap() {
  const userSession = await auth.api.getSession({
    headers: await headers(),
  });

  const address = userSession?.user.wallet;

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-bold text-3xl tracking-tight">Swap tokens</h2>
      </div>
      <Swap address={address as Address} />
    </>
  );
}

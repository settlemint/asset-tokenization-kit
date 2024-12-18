import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import type { Address } from 'viem';
import { PortfolioTable } from './_components/portfolio-table';

// TODO: we need to track the state of the portfolio over time, cfr Bolero
// Challenge is how that we do not have a base currency token, so how do we unify the graph y axis?

export default async function UserPortfolio() {
  const userSession = await auth.api.getSession({
    headers: await headers(),
  });

  const address = userSession?.user.wallet;

  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-bold text-3xl tracking-tight">Portfolio</h2>
      </div>
      <PortfolioTable address={address as Address} />
    </>
  );
}

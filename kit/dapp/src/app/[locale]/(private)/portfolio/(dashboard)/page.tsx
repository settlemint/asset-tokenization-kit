import { getAuthenticatedUser } from '@/lib/auth/auth';
import { getPortfolioDashboardData } from '@/lib/queries/portfolio/portfolio-dashboard';

import type { Address } from 'viem';
import { Greeting } from './_components/greeting/greeting';
import { MyAssetsHeader } from './_components/header/my-assets-header';
export const dynamic = 'force-dynamic';

export default async function PortfolioDashboard() {
  const user = await getAuthenticatedUser();
  const portfolioDashboardData = await getPortfolioDashboardData(user.wallet as Address)
  return (
    <>
      <div className="space-y-4">
        <Greeting />
        <MyAssetsHeader wallet={user.wallet as Address} data={portfolioDashboardData} />
      </div>
    </>
  );
}
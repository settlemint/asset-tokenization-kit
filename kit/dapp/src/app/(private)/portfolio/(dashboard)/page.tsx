import { Greeting } from '@/app/(private)/portfolio/(dashboard)/_components/greeting';
import { MyAssetsCount } from '@/app/(private)/portfolio/(dashboard)/_components/my-assets/count/count';
import { Distribution } from '@/app/(private)/portfolio/(dashboard)/_components/my-assets/distribution/distribution';
import { getMyAssets } from '@/components/blocks/my-assets-table/data';
import { TransactionsHistory } from '@/components/blocks/transactions-history/transactions-history';
import { PageHeader } from '@/components/layout/page-header';
import { getAuthenticatedUser } from '@/lib/auth/auth';
import { LatestEvents } from './_components/latest-events/latest-events';
import { MyAssets } from './_components/my-assets/(table)/table';
import { DashboardTransferForm } from './_components/transfer/transfer';

export default async function PortfolioPage() {
  const user = await getAuthenticatedUser();
  const myAssets = await getMyAssets();
  return (
    <>
      <div className="space-y-4">
        <Greeting />
        <div className="flex items-center justify-between">
          <MyAssetsCount />
          <DashboardTransferForm assets={myAssets.balances} />
        </div>
        <TransactionsHistory
          from={user.wallet}
          chartOptions={{
            intervalType: 'month',
            intervalLength: 1,
            granularity: 'day',
            chartContainerClassName: 'h-[14rem] w-full',
          }}
        />
      </div>
      <PageHeader title="My Assets" className="mt-8" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Distribution />
        <MyAssets />
      </div>
      <PageHeader title="Latest Events" className="mt-8" />
      <LatestEvents />
    </>
  );
}

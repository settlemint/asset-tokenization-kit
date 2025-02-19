import { Greeting } from '@/app/(private)/portfolio/(dashboard)/_components/greeting';
import { MyAssets } from '@/app/(private)/portfolio/(dashboard)/_components/my-assets/count/count';
import { Distribution } from '@/app/(private)/portfolio/(dashboard)/_components/my-assets/distribution/distribution';
import { TransactionsHistory } from '@/components/blocks/transactions-history/transactions-history';
import { getAuthenticatedUser } from '@/lib/auth/auth';

export default async function PortfolioPage() {
  const user = await getAuthenticatedUser();
  return (
    <div className="space-y-4">
      <Greeting />
      <MyAssets />
      <TransactionsHistory
        from={user.wallet}
        chartOptions={{
          intervalType: 'month',
          intervalLength: 1,
          granularity: 'day',
          chartContainerClassName: 'h-[14rem] w-full',
        }}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Distribution />
      </div>
    </div>
  );
}

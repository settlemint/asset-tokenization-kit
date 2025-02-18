import { TransactionsHistory } from '@/components/blocks/transactions-history/transactions-history';
import { getAuthenticatedUser } from '@/lib/auth/auth';
import { Greeting } from './greeting';
import { MyAssets } from './my-assets/count/count';
import { Distribution } from './my-assets/distribution/distribution';

export async function PortfolioOverview() {
  const user = await getAuthenticatedUser();
  return (
    <div className="space-y-4">
      <Greeting />
      <MyAssets />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <TransactionsHistory
          from={user.wallet}
          chartOptions={{
            intervalType: 'month',
            intervalLength: 1,
            granularity: 'day',
          }}
        />
        <Distribution />
      </div>
    </div>
  );
}

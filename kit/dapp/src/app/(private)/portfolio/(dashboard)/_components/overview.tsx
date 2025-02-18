import { TransactionsHistory } from '@/components/blocks/transactions-history/transactions-history';
import { getAuthenticatedUser } from '@/lib/auth/auth';
import { Greeting } from './greeting';
import { MyAssets } from './my-assets/my-assets';

export async function PortfolioOverview() {
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
        }}
      />
    </div>
  );
}

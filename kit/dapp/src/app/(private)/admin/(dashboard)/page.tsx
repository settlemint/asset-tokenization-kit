import { TransactionsHistory } from '@/components/blocks/transactions-history/transactions-history';
import { AssetActivity } from './_components/charts/assets-activity/asset-activity';
import { AssetsSupply } from './_components/charts/assets-supply/assets-supply';
import { UsersHistory } from './_components/charts/users/users-history';
import LatestTransactions from './_components/table/latest-transactions/latest-transactions';
import { AssetsWidget } from './_components/widgets/assets/assets';
import { TransactionsWidget } from './_components/widgets/transactions/transactions';
import { UsersWidget } from './_components/widgets/users/users';

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 divide-x-0 divide-y lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        <AssetsWidget />
        <TransactionsWidget />
        <UsersWidget />
      </div>
      <p className="mt-8 mb-4 font-semibold text-2xl">Stats</p>
      <div className="grid grid-cols-1 gap-4 divide-x-0 divide-y lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        <AssetsSupply />
        <AssetActivity />
        <UsersHistory />
        <TransactionsHistory
          chartOptions={{
            intervalType: 'day',
            intervalLength: 7,
            granularity: 'day',
          }}
        />
      </div>
      <p className="mt-8 mb-4 font-semibold text-2xl">Latest Transactions</p>
      <LatestTransactions />
    </div>
  );
}

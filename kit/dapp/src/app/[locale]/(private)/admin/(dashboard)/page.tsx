import { PageHeader } from '@/components/layout/page-header';
import { AssetActivity } from './_components/charts/asset-activity';
import { AssetsSupply } from './_components/charts/assets-supply';
import { TransactionsHistory } from './_components/charts/transaction-history';
import { UsersHistory } from './_components/charts/users-history';
import { LatestEvents } from './_components/table/latest-events';
import { AssetsWidget } from './_components/widgets/assets';
import { TransactionsWidget } from './_components/widgets/transactions';
import { UsersWidget } from './_components/widgets/users';

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  return (
    <>
      <PageHeader title="Dashboard" />
      <div className="grid grid-cols-1 gap-4 divide-x-0 divide-y lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        <AssetsWidget />
        <TransactionsWidget />
        <UsersWidget />
      </div>
      <p className="mt-8 mb-4 font-semibold text-2xl">Stats</p>
      <div className="grid grid-cols-1 gap-4 divide-x-0 divide-y lg:grid-cols-4 lg:divide-x lg:divide-y-0">
        <AssetsSupply />
        <AssetActivity />
        <UsersHistory />
        <TransactionsHistory />
      </div>
      <p className="mt-8 mb-4 font-semibold text-2xl">Latest Events</p>
      <LatestEvents />
    </>
  );
}

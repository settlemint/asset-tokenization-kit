export const dynamic = 'force-dynamic';
import { AssetsWidget } from './_components/widgets/assets/assets';
import { AssetsPieChart } from './_components/widgets/assets/assets-pie-chart';
import { TransactionsWidget } from './_components/widgets/transactions/transactions';
import { UsersWidget } from './_components/widgets/users/users';

export default function AdminDashboard() {
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 divide-x-0 divide-y lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        <AssetsWidget />
        <TransactionsWidget />
        <UsersWidget />
      </div>
      <p className="mt-8 mb-4 font-bold text-2xl">Stats</p>
      <div className="grid grid-cols-1 gap-4 divide-x-0 divide-y lg:grid-cols-3 lg:divide-x lg:divide-y-0">
        <AssetsPieChart />
      </div>
    </div>
  );
}

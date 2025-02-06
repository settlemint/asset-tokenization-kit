export const dynamic = 'force-dynamic';

import { AssetsWidget } from './_components/widgets/assets/assets';
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
    </div>
  );
}

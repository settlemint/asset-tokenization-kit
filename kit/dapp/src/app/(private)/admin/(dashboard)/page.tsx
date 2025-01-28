import { AssetTotalSupplyStat } from './_components/dashboard-metrics/assets-supply/stat';
import { ProcessedTransactionsStat } from './_components/dashboard-metrics/transactions/stat';
import { UsersStat } from './_components/dashboard-metrics/users/stat';

export default function AdminDashboard() {
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 divide-x-0 divide-y md:grid-cols-2 md:divide-x md:divide-y-0 lg:grid-cols-3">
        <AssetTotalSupplyStat />
        <UsersStat />
        <ProcessedTransactionsStat />
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </div>
  );
}

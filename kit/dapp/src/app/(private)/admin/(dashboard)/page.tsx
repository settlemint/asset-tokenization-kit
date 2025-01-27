import { DashboardMetricsCard } from './_components/dashboard-metrics/dashboard-metrics-card';
import { getTokenSupplyData } from './_components/dashboard-metrics/token-supply/data';
import { getProcessedTransactions } from './_components/dashboard-metrics/transactions/data';
import { getUsersData } from './_components/dashboard-metrics/users/data';

export default async function AdminDashboard() {
  const [tokenSupplyData, usersData, transactionsData] = await Promise.all([
    getTokenSupplyData(),
    getUsersData(),
    getProcessedTransactions(),
  ]);

  return (
    <div>
      <div>
        <DashboardMetricsCard
          tokens={tokenSupplyData}
          users={usersData}
          transactions={transactionsData}
          network={{
            status: 'Healthy',
            message: 'All systems operational',
          }}
        />
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </div>
  );
}

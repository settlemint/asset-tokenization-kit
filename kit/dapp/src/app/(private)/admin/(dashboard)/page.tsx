import { DashboardMetricsCard } from './_components/dashboard-metrics/dashboard-metrics-card';
import { getTokenSupplyData } from './_components/dashboard-metrics/token-supply/data';
import { getUsersData } from './_components/dashboard-metrics/users/data';

export default async function AdminDashboard() {
  const [tokenSupplyData, usersData] = await Promise.all([getTokenSupplyData(), getUsersData()]);

  return (
    <div>
      <div>
        <DashboardMetricsCard
          tokens={tokenSupplyData}
          users={usersData}
          transactions={{
            totalTransactions: 0,
            transactionsInLast24Hours: 0,
          }}
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

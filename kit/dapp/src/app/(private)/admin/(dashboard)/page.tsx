import { DashboardMetricsCard } from './_components/dashboard-metrics/dashboard-metrics-card';
import { getTokenSupplyData } from './_components/dashboard-metrics/data';

export default async function AdminDashboard() {
  const tokenSupplyData = await getTokenSupplyData();

  return (
    <div>
      <div>
        <DashboardMetricsCard
          tokens={{
            totalSupply: tokenSupplyData.totalSupply,
            breakdown: tokenSupplyData.breakdown,
          }}
          users={{
            totalUsers: 0,
            newUsers: 0,
          }}
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

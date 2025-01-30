import { DashboardChartsClient } from './_components/dashboard-charts/chart-client';
import { DashboardStats } from './_components/dashboard-stats/stat';

export default function AdminDashboard() {
  return (
    <div>
      <DashboardStats />
      <DashboardChartsClient />
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </div>
  );
}

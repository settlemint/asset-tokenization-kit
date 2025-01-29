import { DashboardStats } from './_components/dashboard-stats/stat';

export default function AdminDashboard() {
  return (
    <div>
      <DashboardStats />

      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </div>
  );
}

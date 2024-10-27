import { TokenCharts } from "@/components/token-charts/token-charts";

export default function IssuerDashboard() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <TokenCharts />
    </>
  );
}

import { TokenCharts } from "@/components/token-charts/token-charts";

// TODO: the admin of the platform should be able to set a base token for the platform
//    - this will allow us to unify the prices we show
//    - this should be set in the factories as well, as soon as it is set, no pool for a token can be created without at least a pool to the base currency

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

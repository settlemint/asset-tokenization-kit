'use client';
import { DASHBOARD_CHART_QUERY_KEY } from '@/app/(private)/admin/(dashboard)/_components/consts';
import { getDashboardCharts } from '@/app/(private)/admin/(dashboard)/_components/dashboard-charts/data';
import { AreaChartComponent } from '@/components/ui/area-chart';
import { BarChartComponent } from '@/components/ui/bar-chart';
import { LineChartComponent } from '@/components/ui/line-chart';
import { PieChartComponent } from '@/components/ui/pie-chart';
import { useSuspenseQuery } from '@tanstack/react-query';

export function DashboardChartsClient() {
  const { data } = useSuspenseQuery({
    queryKey: [DASHBOARD_CHART_QUERY_KEY],
    queryFn: () => getDashboardCharts(),
    refetchInterval: 1000 * 10,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    networkMode: 'online',
  });
  return (
    <div>
      <p className="mt-8 mb-4 font-bold text-2xl">Stats</p>
      <div className="grid grid-cols-3 gap-4">
        <PieChartComponent
          title="Assets supply"
          data={[
            {
              assetName: 'stableCoins',
              totalSupply: Number(data.assetsSupplyData.breakdown.stableCoins),
              fill: 'hsl(var(--chart-1))',
            },
            {
              assetName: 'bonds',
              totalSupply: Number(data.assetsSupplyData.breakdown.bonds),
              fill: 'hsl(var(--chart-2))',
            },
            {
              assetName: 'equities',
              totalSupply: Number(data.assetsSupplyData.breakdown.equities),
              fill: 'hsl(var(--chart-3))',
            },
            {
              assetName: 'cryptoCurrencies',
              totalSupply: Number(data.assetsSupplyData.breakdown.cryptoCurrencies),
              fill: 'hsl(var(--chart-4))',
            },
          ]}
          config={{
            totalSupply: {
              label: 'Total supply',
            },
            stableCoins: {
              label: 'Stable coins',
              color: 'hsl(var(--chart-1))',
            },
            bonds: {
              label: 'Bonds',
              color: 'hsl(var(--chart-2))',
            },
            equities: {
              label: 'Equities',
              color: 'hsl(var(--chart-3))',
            },
            cryptoCurrencies: {
              label: 'Cryptocurrencies',
              color: 'hsl(var(--chart-4))',
            },
          }}
          dataKey="totalSupply"
          nameKey="assetName"
        />
        <BarChartComponent />
        <AreaChartComponent />
        <LineChartComponent />
      </div>
    </div>
  );
}

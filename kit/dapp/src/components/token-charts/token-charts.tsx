'use client';

import type { ChartConfig } from '@/components/ui/chart';
import { ChartCard } from './chart-card';
import { calculateTrend } from './chart-utils';
import { useVolumeChartData } from './use-chart-data';

const chartConfig = {
  volume: {
    label: 'Volume',
    color: 'hsl(var(--chart-1))',
  },
  transfers: {
    label: 'Transfers',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function TokenCharts({ token }: { token?: string }) {
  const { data: dataDay } = useVolumeChartData('day', token);
  const { data: dataHour } = useVolumeChartData('hour', token);

  const volumeTrendDay = calculateTrend(dataDay ?? [], 'volume');
  const transfersTrendDay = calculateTrend(dataDay ?? [], 'transfers');
  const volumeTrendHour = calculateTrend(dataHour ?? [], 'volume');
  const transfersTrendHour = calculateTrend(dataHour ?? [], 'transfers');

  return (
    <>
      <div className="grid grid-cols-4 gap-4">
        <ChartCard
          title="Volume per day"
          description={`${dataDay?.[0]?.timestamp} - ${dataDay?.[dataDay.length - 1]?.timestamp}`}
          data={dataDay ?? []}
          dataKey="volume"
          color="var(--color-volume)"
          trend={volumeTrendDay}
          interval="day"
          chartConfig={chartConfig}
        />
        <ChartCard
          title="Volume per hour"
          description={`${dataHour?.[0]?.timestamp} - ${dataHour?.[dataHour.length - 1]?.timestamp}`}
          data={dataHour ?? []}
          dataKey="volume"
          color="var(--color-volume)"
          trend={volumeTrendHour}
          interval="hour"
          chartConfig={chartConfig}
        />
        <ChartCard
          title="Transfers per day"
          description={`${dataDay?.[0]?.timestamp} - ${dataDay?.[dataDay.length - 1]?.timestamp}`}
          data={dataDay ?? []}
          dataKey="transfers"
          color="var(--color-transfers)"
          trend={transfersTrendDay}
          interval="day"
          chartConfig={chartConfig}
        />
        <ChartCard
          title="Transfers per hour"
          description={`${dataHour?.[0]?.timestamp} - ${dataHour?.[dataHour.length - 1]?.timestamp}`}
          data={dataHour ?? []}
          dataKey="transfers"
          color="var(--color-transfers)"
          trend={transfersTrendHour}
          interval="hour"
          chartConfig={chartConfig}
        />
      </div>
    </>
  );
}

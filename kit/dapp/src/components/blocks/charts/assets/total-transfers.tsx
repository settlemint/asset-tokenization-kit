'use client';

import { AreaChartComponent } from '@/components/blocks/charts/area-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { createTimeSeries } from '@/lib/charts';
import { useAssetStats } from '@/lib/queries/asset-stats/asset-stats';
import { useTranslations } from 'next-intl';
import type { Address } from 'viem';

interface TotalTransfersProps {
  address: Address;
}

export function TotalTransfers({ address }: TotalTransfersProps) {
  const t = useTranslations('components.charts.assets');

  const chartConfig = {
    totalTransfers: {
      label: t('total-transfers.label'),
      color: 'hsl(var(--chart-2))',
    },
  } satisfies ChartConfig;

  const { data } = useAssetStats({ address });

  const timeseries = createTimeSeries(data, ['totalTransfers'], {
    granularity: 'hour',
    intervalType: 'day',
    intervalLength: 1,
    aggregation: 'first',
  });

  return (
    <AreaChartComponent
      data={timeseries}
      config={chartConfig}
      title={t('total-transfers.title')}
      description={t('total-transfers.description')}
      xAxis={{ key: 'timestamp' }}
      showYAxis={true}
      footer={
        <div className="text-muted-foreground text-xs">
          {t('last-updated')}: {timeseries.at(-1)?.timestamp}
        </div>
      }
    />
  );
}

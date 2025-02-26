'use client';
import { AreaChartComponent } from '@/components/blocks/charts/area-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { createTimeSeries } from '@/lib/charts';
import { useAssetStats } from '@/lib/queries/asset-stats/asset-stats';
import { useTranslations } from 'next-intl';
import type { Address } from 'viem';

interface TotalVolumeProps {
  address: Address;
}

export function TotalVolume({ address }: TotalVolumeProps) {
  const t = useTranslations('components.charts.assets');

  const chartConfig = {
    totalVolume: {
      label: t('total-volume.label'),
      color: 'hsl(var(--chart-2))',
    },
  } satisfies ChartConfig;

  const { data } = useAssetStats({ address });

  const timeseries = createTimeSeries(data, ['totalVolume'], {
    granularity: 'hour',
    intervalType: 'day',
    intervalLength: 1,
    aggregation: 'first',
  });

  return (
    <AreaChartComponent
      data={timeseries}
      config={chartConfig}
      title={t('total-volume.title')}
      description={t('total-volume.description')}
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

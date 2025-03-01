import { AreaChartComponent } from '@/components/blocks/charts/area-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { createTimeSeries } from '@/lib/charts';
import { getAssetStats } from '@/lib/queries/asset-stats/asset-stats';
import { getTranslations } from 'next-intl/server';
import type { Address } from 'viem';

interface TotalVolumeProps {
  address: Address;
}

export async function TotalVolume({ address }: TotalVolumeProps) {
  const t = await getTranslations('components.charts.assets');

  const chartConfig = {
    totalVolume: {
      label: t('total-volume.label'),
      color: 'var(--chart-1)',
    },
  } satisfies ChartConfig;

  const data = await getAssetStats({ address });

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

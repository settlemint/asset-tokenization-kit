'use client';
import { AreaChartComponent } from '@/components/blocks/charts/area-chart';
import type { ChartConfig } from '@/components/ui/chart';
import { createTimeSeries } from '@/lib/charts';
import { useAssetStats } from '@/lib/queries/asset-stats/asset-stats';
import { useTranslations } from 'next-intl';
import type { Address } from 'viem';

interface TotalSupplyProps {
  address: Address;
}

export function TotalSupply({ address }: TotalSupplyProps) {
  const t = useTranslations('components.charts.assets');

  const chartConfig = {
    totalSupply: {
      label: t('total-supply.label'),
      color: 'hsl(var(--chart-2))',
    },
  } satisfies ChartConfig;

  const { data } = useAssetStats({ address });

  const timeseries = createTimeSeries(data, ['totalSupply'], {
    granularity: 'hour',
    intervalType: 'day',
    intervalLength: 1,
    accumulation: 'max',
    aggregation: 'first',
    historical: true,
  });

  return (
    <AreaChartComponent
      data={timeseries}
      config={chartConfig}
      title={t('total-supply.title')}
      description={t('total-supply.description')}
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

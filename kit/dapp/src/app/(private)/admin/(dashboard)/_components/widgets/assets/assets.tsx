import { getAssetsWidgetData } from '@/app/(private)/admin/(dashboard)/_components/widgets/assets/data';
import { QueryWrapper } from '@/components/blocks/query-wrapper/query-wrapper';
import { assetsQueryKey } from '@/lib/config/assets';
import { AssetsWidgetClient } from './assets-client';
import { AssetsPieChartClient } from './assets-pie-chart-client';

export function AssetsWidget() {
  return <QueryWrapper queryKey={assetsQueryKey} queryFn={getAssetsWidgetData} ClientComponent={AssetsWidgetClient} />;
}

export function AssetsPieChart() {
  return (
    <QueryWrapper queryKey={assetsQueryKey} queryFn={getAssetsWidgetData} ClientComponent={AssetsPieChartClient} />
  );
}

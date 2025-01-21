import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import type { ComponentType } from 'react';
import { AssetTableClient } from './asset-table-client';
import type { BaseAsset } from './asset-table-types';

export type AssetTableProps<Asset extends BaseAsset = BaseAsset> = {
  type: string;
  dataAction: () => Promise<Asset[]>;
  refetchInterval?: number;
  icons?: Record<string, ComponentType<{ className?: string }>>;
};

export async function AssetTable<Asset extends BaseAsset>({
  dataAction,
  type,
  refetchInterval,
  icons,
}: AssetTableProps<Asset>) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: [type],
    queryFn: () => dataAction(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AssetTableClient refetchInterval={refetchInterval} type={type} dataAction={dataAction} icons={icons} />
    </HydrationBoundary>
  );
}

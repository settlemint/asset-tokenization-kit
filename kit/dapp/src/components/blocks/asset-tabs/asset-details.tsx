import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import type { useReactTable } from '@tanstack/react-table';
import type { ComponentType } from 'react';
import { Suspense } from 'react';
import { AssetDetailsClient } from './asset-details-client';

export type AssetTableProps<Asset> = {
  type: string;
  dataAction: () => Promise<Asset[]>;
  refetchInterval?: number;
  icons?: Record<string, ComponentType<{ className?: string }>>;
  cells: Parameters<typeof useReactTable<Asset>>[0]['columns'];
};

export async function AssetTabDetail<Asset>({
  dataAction,
  type,
  refetchInterval,
  icons,
  cells,
}: AssetTableProps<Asset>) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: [type],
    queryFn: () => dataAction(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <AssetDetailsClient
          refetchInterval={refetchInterval}
          type={type}
          dataAction={dataAction}
          icons={icons}
          cells={cells}
        />
      </Suspense>
    </HydrationBoundary>
  );
}

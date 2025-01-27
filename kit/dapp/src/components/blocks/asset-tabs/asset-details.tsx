import { AssetDetailsHeader } from '@/components/blocks/asset-tabs/asset-details-header';
import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import type { ComponentType } from 'react';
import { Suspense } from 'react';
import { AssetDetailsClient } from './asset-details-client';

export type AssetTableProps<Asset> = {
  id: string;
  type: string;
  dataAction: (id: string) => Promise<Asset>;
  refetchInterval?: number;
  icons?: Record<string, ComponentType<{ className?: string }>>;
};

export async function AssetDetails<Asset>({ id, dataAction, type, refetchInterval, icons }: AssetTableProps<Asset>) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: [`${type}-${id}`],
    queryFn: () => dataAction(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AssetDetailsHeader id={id} />
      <Suspense>
        <AssetDetailsClient
          id={id}
          refetchInterval={refetchInterval}
          type={type}
          dataAction={dataAction}
          icons={icons}
        />
      </Suspense>
    </HydrationBoundary>
  );
}

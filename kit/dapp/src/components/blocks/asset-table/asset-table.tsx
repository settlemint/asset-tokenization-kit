import { getQueryClient } from '@/lib/react-query';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import type { useReactTable } from '@tanstack/react-table';
import type { ComponentType } from 'react';
import { AssetTableClient } from './asset-table-client';

export type AssetTableProps<Asset> = {
  type: string;
  dataAction: () => Promise<Asset[]>;
  refetchInterval?: number;
  icons?: Record<string, ComponentType<{ className?: string }>>;
  columns: Parameters<typeof useReactTable<Asset>>[0]['columns'];
};

export async function AssetTable<Asset>({ dataAction, type, refetchInterval, icons, columns }: AssetTableProps<Asset>) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: [type],
    queryFn: () => dataAction(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AssetTableClient
        refetchInterval={refetchInterval}
        type={type}
        dataAction={dataAction}
        icons={icons}
        columns={columns}
      />
    </HydrationBoundary>
  );
}

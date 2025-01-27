'use client';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { useReactTable } from '@tanstack/react-table';
import type { ComponentType } from 'react';
import { AssetDetailsGrid } from './asset-details-grid';

export type AssetTableClientProps<Asset> = {
  type: string;
  dataAction: () => Promise<Asset[]>;
  refetchInterval?: number;
  icons?: Record<string, ComponentType<{ className?: string }>>;
  cells: Parameters<typeof useReactTable<Asset>>[0]['columns'];
};

export function AssetDetailsClient<Asset>({
  dataAction,
  type,
  refetchInterval,
  cells,
  icons,
}: AssetTableClientProps<Asset>) {
  const { data } = useSuspenseQuery<Asset[]>({
    queryKey: [type],
    queryFn: () => dataAction(),
    refetchInterval: refetchInterval,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    networkMode: 'online',
  });

  return <AssetDetailsGrid cells={cells} data={data} icons={icons ?? {}} name={type} />;
}

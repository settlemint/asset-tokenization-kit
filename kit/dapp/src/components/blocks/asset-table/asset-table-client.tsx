'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { useReactTable } from '@tanstack/react-table';
import type { ComponentType } from 'react';

export type AssetTableClientProps<Asset> = {
  type: string;
  dataAction: () => Promise<Asset[]>;
  refetchInterval?: number;
  icons?: Record<string, ComponentType<{ className?: string }>>;
  columns: Parameters<typeof useReactTable<Asset>>[0]['columns'];
};

export function AssetTableClient<Asset>({
  dataAction,
  type,
  refetchInterval,
  columns,
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

  return <DataTable columns={columns} data={data} icons={icons ?? {}} name={type} />;
}

'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import type { ComponentType } from 'react';
import type { BaseAsset } from './asset-table-types';

export type AssetTableClientProps<Asset extends BaseAsset> = {
  type: string;
  dataAction: () => Promise<Asset[]>;
  refetchInterval?: number;
  icons?: Record<string, ComponentType<{ className?: string }>>;
  columns: ColumnDef<Asset>[];
};

export function AssetTableClient<Asset extends BaseAsset>({
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

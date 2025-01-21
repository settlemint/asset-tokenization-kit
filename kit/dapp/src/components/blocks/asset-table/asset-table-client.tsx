'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { ComponentType, ReactElement } from 'react';
import { assetTableColumns } from './asset-table-columns';
import type { BaseAsset } from './asset-table-types';

export type AssetTableClientProps<Asset extends BaseAsset> = {
  type: string;
  dataAction: () => Promise<Asset[]>;
  refetchInterval?: number;
  rowActions?: ReactElement[];
  icons?: Record<string, ComponentType<{ className?: string }>>;
};

export function AssetTableClient<Asset extends BaseAsset>({
  dataAction,
  type,
  refetchInterval,
  rowActions,
  icons,
}: AssetTableClientProps<Asset>) {
  const { data } = useSuspenseQuery<Asset[]>({
    queryKey: [type],
    queryFn: () => dataAction(),
    refetchInterval: refetchInterval,
  });

  return <DataTable columns={assetTableColumns<Asset>(type, rowActions)} data={data} icons={icons ?? {}} name={type} />;
}

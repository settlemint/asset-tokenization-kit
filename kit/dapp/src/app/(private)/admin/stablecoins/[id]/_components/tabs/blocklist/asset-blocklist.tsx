'use client';
import { AssetTabHeader } from '@/components/blocks/asset-tabs/asset-tab-header';
import type { TokenTypeValue } from '@/types/token-types';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { ComponentType } from 'react';
import type { StableCoinDetail } from '../../data';
import { AssetBlockListTable } from './asset-blocklist-table';

export type AssetBlockListProps<Asset> = {
  dataAction: (id: string) => Promise<Asset>;
  type: TokenTypeValue;
  id: string;
  refetchInterval?: number;
  icons?: Record<string, ComponentType<{ className?: string }>>;
};

export function AssetBlockList<Asset extends StableCoinDetail>({
  dataAction,
  type,
  id,
  refetchInterval,
  icons,
}: AssetBlockListProps<Asset>) {
  const { data } = useSuspenseQuery<Asset>({
    queryKey: [`${type}-${id}`],
    queryFn: () => dataAction(id),
    refetchInterval: refetchInterval,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    networkMode: 'online',
  });
  return (
    <div className="AssetBlockList">
      <AssetTabHeader data={data} />
      <AssetBlockListTable<Asset> cells={[]} data={data} icons={icons ?? {}} name={type} />
    </div>
  );
}

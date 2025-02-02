'use client';
import { AssetTabHeader } from '@/components/blocks/asset-tabs/asset-tab-header';
import type { TokenTypeValue } from '@/types/token-types';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { ComponentType } from 'react';
import type { StableCoinDetail } from '../../data';
import { AssetHoldersTable } from './asset-holders-table';

export type AssetHoldersProps<Asset> = {
  dataAction: (id: string) => Promise<Asset>;
  type: TokenTypeValue;
  id: string;
  refetchInterval?: number;
  icons?: Record<string, ComponentType<{ className?: string }>>;
};

export function AssetHolders<Asset extends StableCoinDetail>({
  dataAction,
  type,
  id,
  refetchInterval,
  icons,
}: AssetHoldersProps<Asset>) {
  const { data } = useSuspenseQuery<Asset>({
    queryKey: [`${type}-${id}`],
    queryFn: () => dataAction(id),
    refetchInterval: refetchInterval,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    networkMode: 'online',
  });
  return (
    <div className="AssetHolders">
      <AssetTabHeader data={data} />
      <AssetHoldersTable<Asset> cells={[]} data={data} icons={icons ?? {}} name={type} />
    </div>
  );
}

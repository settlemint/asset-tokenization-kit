'use client';
import { AssetTabHeader } from '@/components/blocks/asset-tabs/asset-tab-header';
import type { TokenTypeValue } from '@/types/token-types';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { ComponentType } from 'react';
import type { StableCoinAsset } from '../../../../_components/data';
import { AssetEventsTable } from './asset-events-table';

export type AssetEventsProps<Asset> = {
  dataAction: (id: string) => Promise<Asset>;
  type: TokenTypeValue;
  id: string;
  refetchInterval?: number;
  icons?: Record<string, ComponentType<{ className?: string }>>;
};

export function AssetEvents<Asset extends StableCoinAsset>({
  dataAction,
  type,
  id,
  refetchInterval,
  icons,
}: AssetEventsProps<Asset>) {
  const { data } = useSuspenseQuery<Asset>({
    queryKey: [`${type}-${id}`],
    queryFn: () => dataAction(id),
    refetchInterval: refetchInterval,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    networkMode: 'online',
  });
  return (
    <div className="AssetEvents">
      <AssetTabHeader data={data} />
      <AssetEventsTable<Asset> cells={[]} data={data} icons={icons ?? {}} name={type} />
    </div>
  );
}

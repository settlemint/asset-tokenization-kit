'use client';
import { AssetDetailsHeader } from '@/components/blocks/asset-tabs/asset-details-header';
import type { TokenTypeValue } from '@/types/token-types';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { ComponentType } from 'react';
import type { StableCoinAsset } from '../../_components/data';
import { AssetDetailsGrid } from './asset-details-grid';

export type AssetDetailsClientProps<Asset> = {
  dataAction: (id: string) => Promise<Asset>;
  type: TokenTypeValue;
  id: string;
  refetchInterval?: number;
  icons?: Record<string, ComponentType<{ className?: string }>>;
};

export function AssetDetailsClient<Asset extends StableCoinAsset>({
  dataAction,
  type,
  id,
  refetchInterval,
  icons,
}: AssetDetailsClientProps<Asset>) {
  const { data } = useSuspenseQuery<Asset>({
    queryKey: [`${type}-${id}`],
    queryFn: () => dataAction(id),
    refetchInterval: refetchInterval,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    networkMode: 'online',
  });
  return (
    <div className="AssetDetailsClient">
      <AssetDetailsHeader data={data} />
      <AssetDetailsGrid<Asset> cells={[]} data={data} icons={icons ?? {}} name={type} />
    </div>
  );
}

'use client';
import { AssetDetailsTab } from '@/components/blocks/asset-tabs/asset-details-tab';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { ComponentType } from 'react';
import { AssetDetailsGrid } from './asset-details-grid';

export type AssetDetailsClientProps<
  Asset extends {
    id: string;
    name: string | null;
    paused: boolean;
    symbol: string | null;
    isin: string | null;
    totalSupply: string;
    totalSupplyExact: string;
    collateral: string;
    collateralExact: string;
  },
> = {
  id: string;
  type: string;
  dataAction: (id: string) => Promise<Asset>;
  refetchInterval?: number;
  icons?: Record<string, ComponentType<{ className?: string }>>;
};

export function AssetDetailsClient<
  Asset extends {
    id: string;
    name: string | null;
    paused: boolean;
    symbol: string | null;
    isin: string | null;
    totalSupply: string;
    totalSupplyExact: string;
    collateral: string;
    collateralExact: string;
  },
>({ dataAction, type, id, refetchInterval, icons }: AssetDetailsClientProps<Asset>) {
  const { data } = useSuspenseQuery<Asset>({
    queryKey: [`${type}-${id}`],
    queryFn: () => dataAction(id),
    refetchInterval: refetchInterval,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    networkMode: 'online',
  });
  return (
    <>
      <AssetDetailsTab data={{ id: data.id, name: data.name, paused: data.paused }}>
        <AssetDetailsGrid cells={[]} data={data} icons={icons ?? {}} name={type} />
      </AssetDetailsTab>
    </>
  );
}

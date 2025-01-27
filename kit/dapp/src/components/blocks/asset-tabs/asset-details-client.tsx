'use client';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { ComponentType } from 'react';
import { AssetDetailsGrid } from './asset-details-grid';

export type AssetDetailsClientProps<Asset> = {
  id: string;
  type: string;
  dataAction: (id: string) => Promise<Asset>;
  refetchInterval?: number;
  icons?: Record<string, ComponentType<{ className?: string }>>;
};

export function AssetDetailsClient<Asset>({
  dataAction,
  type,
  id,
  refetchInterval,
  icons,
}: AssetDetailsClientProps<Asset>) {
  const { data } = useSuspenseQuery<Asset>({
    queryKey: [type],
    queryFn: () => dataAction(id),
    refetchInterval: refetchInterval,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    networkMode: 'online',
  });

  return <AssetDetailsGrid cells={[]} data={data} icons={icons ?? {}} name={type} />;
}
